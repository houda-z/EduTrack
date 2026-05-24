<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examen;
use App\Models\Question;
use App\Models\ChoixQcm;
use App\Models\Filiere;
use App\Models\Groupe;
use App\Models\User;
use App\Models\Note;
use App\Models\SessionExamen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamenController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'etudiant') {
            // Prefer FK columns; fall back to string-name lookup for legacy accounts
            $filiereId = $user->filiere_id;
            $groupeId  = $user->groupe_id;

            if (!$filiereId && $user->filiere) {
                $filiere   = Filiere::where('nom', $user->filiere)->first();
                $filiereId = $filiere ? $filiere->id : null;
            }
            if (!$groupeId && $user->groupe) {
                $groupe   = Groupe::where('nom', $user->groupe)->first();
                $groupeId = $groupe ? $groupe->id : null;
            }

            $query = Examen::with(['formateur:id,name,prenom', 'filiere:id,nom', 'groupe:id,nom', 'questions.choix']);

            if ($filiereId) {
                $query->where('filiere_id', $filiereId);
            }
            if ($groupeId) {
                $query->where('groupe_id', $groupeId);
            }

            // Students only see published, active, or completed exams
            $query->whereIn('statut', ['publie', 'termine', 'actif', 'brouillon']);


            $exams = $query->orderByDesc('date_examen')->get();

        } elseif ($user->role === 'enseignant') {
            $exams = Examen::where('enseignant_id', $user->id)
                ->orWhere('formateur_id', $user->id)
                ->with(['filiere:id,nom', 'groupe:id,nom', 'questions.choix'])
                ->orderByDesc('created_at')
                ->get();
        } else {
            $exams = Examen::with(['filiere:id,nom', 'groupe:id,nom', 'questions.choix'])
                ->orderByDesc('created_at')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $exams,
            'message' => 'Examens récupérés avec succès.'
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
            'groupe_id' => 'required|exists:groupes,id',
            'date_examen' => 'required|date',
            'duree_minutes' => 'required|integer|min:1',
            'type' => 'required|string', // qcm, code, mixte
            'statut' => 'required|string', // brouillon, publie, termine
            'questions' => 'nullable|array',
            'questions.*.enonce' => 'required|string',
            'questions.*.type' => 'required|in:qcm,code,texte',
            'questions.*.points' => 'required|numeric',
            'questions.*.choix' => 'nullable|array',
            'questions.*.choix.*.texte' => 'required|string',
            'questions.*.choix.*.est_correct' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();

            $exam = Examen::create([
                'titre' => $validated['titre'],
                'filiere_id' => $validated['filiere_id'],
                'groupe_id' => $validated['groupe_id'],
                'date_examen' => $validated['date_examen'],
                'duree_minutes' => $validated['duree_minutes'],
                'type' => $validated['type'],
                'statut' => $validated['statut'],
                'enseignant_id' => $user->id,
                'formateur_id' => $user->id,
                'duree' => $validated['duree_minutes'], // legacy support
                'date_debut' => $validated['date_examen'], // legacy support
            ]);

            if (!empty($validated['questions'])) {
                foreach ($validated['questions'] as $idx => $qData) {
                  $question = $exam->questions()->create([
                    'enonce' => $qData['enonce'],
                    'type' => $qData['type'],
                    'points' => $qData['points'],
                    'ordre' => $idx + 1
                ]);
                    

                    if ($qData['type'] === 'qcm' && !empty($qData['choix'])) {
                        foreach ($qData['choix'] as $choiceData) {
                            $question->choix()->create([
                                'texte' => $choiceData['texte'],
                                'est_correct' => $choiceData['est_correct']
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $exam->load('questions.choix'),
                'message' => 'Examen créé avec succès.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création de l\'examen: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $exam = Examen::findOrFail($id);

        if ($exam->formateur_id !== $user->id && $exam->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'filiere_id' => 'required|exists:filieres,id',
            'groupe_id' => 'required|exists:groupes,id',
            'date_examen' => 'required|date',
            'duree_minutes' => 'required|integer|min:1',
            'type' => 'required|string',
            'statut' => 'required|string',
        ]);

        $exam->update($validated);

        return response()->json([
            'success' => true,
            'data' => $exam,
            'message' => 'Examen mis à jour avec succès.'
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $exam = Examen::findOrFail($id);

        if ($exam->formateur_id !== $user->id && $exam->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $exam->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Examen supprimé avec succès.'
        ]);
    }

    public function addQuestions(Request $request, $id)
    {
        $user = auth()->user();
        $exam = Examen::findOrFail($id);

        if ($exam->formateur_id !== $user->id && $exam->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'enonce' => 'required|string',
            'type' => 'required|in:qcm,code,texte',
            'points' => 'required|numeric',
            'choix' => 'nullable|array',
            'choix.*.texte' => 'required|string',
            'choix.*.est_correct' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();
            $question = $exam->questions()->create([
                'enonce' => $validated['enonce'],
                'type' => $validated['type'],
                'points' => $validated['points'],
                'ordre' => $exam->questions()->count() + 1
            ]);

            if ($validated['type'] === 'qcm' && !empty($validated['choix'])) {
                foreach ($validated['choix'] as $choiceData) {
                    $question->choix()->create([
                        'texte' => $choiceData['texte'],
                        'est_correct' => $choiceData['est_correct']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $question->load('choix'),
                'message' => 'Question ajoutée avec succès.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'ajout de la question: ' . $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        $exam = Examen::with([
            'questions.choix',
            'filiere:id,nom',
            'groupe:id,nom'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $exam,
            'message' => 'Examen récupéré.'
        ]);
    }
    public function getResultats($id)
    {
        $user = auth()->user();
        $exam = Examen::findOrFail($id);

        if ($exam->formateur_id !== $user->id && $exam->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        // Get sessions
        $sessions = SessionExamen::where('examen_id', $exam->id)
            ->with(['etudiant'])
            ->get();

        $data = $sessions->map(function($session) use ($exam) {
            // Find note if graded
            $note = Note::where('etudiant_id', $session->etudiant_id)
                ->where('examen_id', $exam->id)
                ->first();

            return [
                'session_id' => $session->id,
                'etudiant_id' => $session->etudiant_id,
                'nom' => $session->etudiant ? $session->etudiant->name : 'Inconnu',
                'prenom' => $session->etudiant ? $session->etudiant->prenom : 'Inconnu',
                'photo' => $session->etudiant ? $session->etudiant->photo : null,
                'statut' => $session->statut, // en_cours, soumis, bloque
                'score' => $note ? $note->note : null,
                'commentaire' => $note ? $note->commentaire : null,
                'started_at' => $session->debut_at ? $session->debut_at->toDateTimeString() : null,
                'finished_at' => $session->fin_at ? $session->fin_at->toDateTimeString() : null,
                'nb_sorties' => $session->nb_sorties,
            ];
        });

        // Calculate average score of graded students
        $averageScore = Note::where('examen_id', $exam->id)->avg('note') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'participants_count' => $sessions->count(),
                'average_score' => round($averageScore, 2),
                'results' => $data
            ],
            'message' => 'Résultats récupérés avec succès.'
        ]);
    }

    public function updateStatut(Request $request, $id)
{
    $user = auth()->user();
    $exam = Examen::findOrFail($id);

    if ($exam->formateur_id !== $user->id && $exam->enseignant_id !== $user->id) {
        return response()->json(['success' => false, 'message' => 'Non autorisé.'], 403);
    }

    $request->validate([
        'statut' => 'required|in:brouillon,publie,termine'
    ]);

    $exam->update(['statut' => $request->statut]);

    return response()->json([
        'success' => true,
        'data'    => $exam,
        'message' => 'Statut mis à jour.'
    ]);
}
}
