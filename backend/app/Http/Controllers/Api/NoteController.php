<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamenReponse;
use App\Models\Note;
use App\Models\SessionExamen;
use App\Models\User;
use App\Services\MoyenneService;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    protected MoyenneService $moyenneService;

    public function __construct(MoyenneService $moyenneService)
    {
        $this->moyenneService = $moyenneService;
    }

    /**
     * POST /api/notes
     * Create or update a note. Accessible by enseignant/admin only.
     * After saving, recalculates the student's moyenne via MoyenneService.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'etudiant_id' => 'required|exists:users,id',
            'examen_id'   => 'nullable|exists:examens,id',
            'cours_id'    => 'nullable|exists:cours,id',
            'note'        => 'required|numeric|min:0|max:20',
            'commentaire' => 'nullable|string',
        ]);

        if (empty($validated['examen_id']) && empty($validated['cours_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Spécifiez soit un examen_id soit un cours_id.'
            ], 422);
        }

        // Check if grade already exists for this context
        $query = Note::where('etudiant_id', $validated['etudiant_id']);
        if (!empty($validated['examen_id'])) {
            $query->where('examen_id', $validated['examen_id']);
        } else {
            $query->where('cours_id', $validated['cours_id'])->whereNull('examen_id');
        }

        $note = $query->first();

        if ($note) {
            $note->update([
                'note'        => $validated['note'],
                'commentaire' => $validated['commentaire'] ?? $note->commentaire,
                'formateur_id' => $user->id,
            ]);
        } else {
            $note = Note::create([
                'etudiant_id'  => $validated['etudiant_id'],
                'formateur_id' => $user->id,
                'examen_id'    => $validated['examen_id'] ?? null,
                'cours_id'     => $validated['cours_id'] ?? null,
                'note'         => $validated['note'],
                'commentaire'  => $validated['commentaire'] ?? '',
            ]);
        }

        // Dynamically recalculate and persist moyenne
        $nouvelleMoyenne = $this->moyenneService->persistMoyenne($validated['etudiant_id']);

        return response()->json([
            'success' => true,
            'data'    => array_merge($note->toArray(), ['nouvelle_moyenne' => $nouvelleMoyenne]),
            'message' => 'Note enregistrée et moyenne recalculée avec succès.'
        ]);
    }

    /**
     * GET /api/notes/etudiant/{id}
     * Accessible by the student themselves (own notes) OR by enseignant/admin.
     * Returns raw note list with related exam/course titles for display purposes.
     * For the full moyenne calculation breakdown use GET /api/etudiant/{id}/moyenne.
     */
    public function getStudentNotes(Request $request, $id)
    {
        $authUser = $request->user();

        if ($authUser->role === 'etudiant' && $authUser->id != (int) $id) {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $examNotes = ExamenReponse::where('etudiant_id', $id)
            ->whereNotNull('note_attribuee')
            ->with(['question:id,enonce,type,points', 'question.examen:id,titre'])
            ->get()
            ->groupBy('examen_id')
            ->map(function ($reponses, $examId) {
                $totalNote = $reponses->sum('note_attribuee');
                $totalPoints = $reponses->sum(fn ($r) => $r->question?->points ?? 1);
                $examTitre = $reponses->first()?->question?->examen?->titre ?? 'Examen';

                return [
                    'examen_id' => $examId,
                    'examen_titre' => $examTitre,
                    'note' => $totalNote,
                    'total_points' => $totalPoints,
                    'type' => 'examen',
                    'created_at' => $reponses->max('updated_at'),
                ];
            })->values();

        $manualNotes = Note::where('etudiant_id', $id)
            ->with(['examen:id,titre', 'cours:id,titre'])
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'note' => $note->note,
                    'commentaire' => $note->commentaire,
                    'examen_titre' => $note->examen?->titre,
                    'cours_titre' => $note->cours?->titre,
                    'type' => 'note',
                    'created_at' => $note->created_at,
                ];
            });

        $session = SessionExamen::where('etudiant_id', $id)
            ->where('statut', 'corrige')
            ->get();
        $moyenne = $session->avg('note_totale') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'exam_notes' => $examNotes,
                'manual_notes' => $manualNotes,
                'moyenne' => round($moyenne, 2),
            ],
            'message' => 'Notes récupérées avec succès.'
        ]);
    }

    /**
     * PUT /api/notes/{id}
     * Update an existing note. Enseignant/admin only.
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $note = Note::findOrFail($id);

        if ($note->formateur_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'note'        => 'required|numeric|min:0|max:20',
            'commentaire' => 'nullable|string',
        ]);

        $note->update([
            'note'        => $validated['note'],
            'commentaire' => $validated['commentaire'] ?? $note->commentaire,
        ]);

        // Dynamically recalculate and persist moyenne
        $nouvelleMoyenne = $this->moyenneService->persistMoyenne($note->etudiant_id);

        return response()->json([
            'success' => true,
            'data'    => array_merge($note->toArray(), ['nouvelle_moyenne' => $nouvelleMoyenne]),
            'message' => 'Note mise à jour et moyenne recalculée avec succès.'
        ]);
    }
}
