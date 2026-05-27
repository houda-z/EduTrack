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
use App\Models\ExamenReponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
            'introduction' => 'nullable|string',
            'filiere_id' => 'required|exists:filieres,id',
            'groupe_id' => 'required|exists:groupes,id',
            'date_examen' => 'required|date',
            'duree_minutes' => 'required|integer|min:1',
            'type' => 'required|string', // qcm, code, mixte
            'statut' => 'required|string', // brouillon, publie, termine
            'questions' => 'nullable|array',
            'questions.*.enonce' => 'required|string',
            'questions.*.type' => 'required|in:qcm,code,texte,commande',
            'questions.*.points' => 'required|numeric',
            'questions.*.file' => 'nullable',
            'questions.*.choix' => 'nullable|array',
            'questions.*.choix.*.texte' => 'nullable|string',
            'questions.*.choix.*.est_correct' => 'nullable|boolean',
            'parties' => 'nullable|array',
            'parties.*.titre' => 'required|string',
            'parties.*.introduction' => 'nullable|string',
            'parties.*.images' => 'nullable|array',
            'parties.*.images.*' => 'nullable|string',
            'parties.*.tableau' => 'nullable|array',
            'parties.*.tableau.headers' => 'nullable|array',
            'parties.*.tableau.rows' => 'nullable|array',
            'parties.*.questions' => 'nullable|array',
            'parties.*.questions.*.enonce' => 'required|string',
            'parties.*.questions.*.type' => 'required|in:qcm,code,texte,commande',
            'parties.*.questions.*.points' => 'nullable|numeric',
            'parties.*.questions.*.file' => 'nullable',
            'parties.*.questions.*.choix' => 'nullable|array',
            'parties.*.questions.*.choix.*.texte' => 'nullable|string',
            'parties.*.questions.*.choix.*.est_correct' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $exam = Examen::create([
                'titre' => $validated['titre'],
                'introduction' => $request->introduction ?? null,
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

            // Save legacy questions if any
            if (!empty($validated['questions'])) {
                foreach ($validated['questions'] as $idx => $qData) {
                    $question = $exam->questions()->create([
                        'enonce' => $qData['enonce'],
                        'type'   => $qData['type'],
                        'points' => $qData['points'],
                        'ordre'  => $idx + 1,
                        'file'   => isset($qData['file']) ? (is_array($qData['file']) ? json_encode($qData['file']) : $qData['file']) : null,
                    ]);

                    if ($qData['type'] === 'qcm' && !empty($qData['choix'])) {
                        foreach ($qData['choix'] as $choiceData) {
                            // Only save non-empty choix
                            if (!empty($choiceData['texte'])) {
                                $question->choix()->create([
                                    'texte' => $choiceData['texte'],
                                    'est_correct' => $choiceData['est_correct']
                                ]);
                            }
                        }
                    }
                }
            }

            // Save parties if any
            if (!empty($validated['parties'])) {
                foreach ($validated['parties'] as $idx => $partieData) {
                    $partie = $exam->parties()->create([
                        'titre' => $partieData['titre'],
                        'introduction' => $partieData['introduction'] ?? null,
                        'ordre' => $idx + 1,
                    ]);

                    // Save images
                    if (!empty($partieData['images'])) {
                        foreach ($partieData['images'] as $imgIdx => $imgBase64) {
                            if ($imgBase64) {
                                $partie->images()->create([
                                    'image' => $imgBase64,
                                    'ordre' => $imgIdx + 1,
                                ]);
                            }
                        }
                    }

                    // Save tableau
                    if (!empty($partieData['tableau']) && !empty($partieData['tableau']['headers'])) {
                        $partie->tableau()->create([
                            'headers' => $partieData['tableau']['headers'],
                            'rows' => $partieData['tableau']['rows'] ?? [],
                        ]);
                    }

                    // Save questions belonging to this party
                    if (!empty($partieData['questions'])) {
                        foreach ($partieData['questions'] as $qIdx => $qData) {
                            $question = $partie->questions()->create([
                                'examen_id' => $exam->id,
                                'enonce' => $qData['enonce'],
                                'type' => $qData['type'], // qcm/code/texte/commande
                                'points' => $qData['points'] ?? 1,
                                'ordre' => $qIdx + 1,
                                'file' => isset($qData['file']) ? (is_array($qData['file']) ? json_encode($qData['file']) : $qData['file']) : null,
                            ]);

                            if ($qData['type'] === 'qcm' && !empty($qData['choix'])) {
                                foreach ($qData['choix'] as $choix) {
                                    // Only save non-empty choix
                                    if (!empty($choix['texte'])) {
                                        $question->choix()->create([
                                            'texte' => $choix['texte'],
                                            'est_correct' => $choix['est_correct'],
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $exam->load(['questions.choix', 'parties.images', 'parties.tableau', 'parties.questions.choix']),
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
            'file' => 'nullable',
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
                'ordre' => $exam->questions()->count() + 1,
                'file' => isset($validated['file']) ? (is_array($validated['file']) ? json_encode($validated['file']) : $validated['file']) : null,
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
            'parties.images',
            'parties.tableau',
            'parties.questions.choix',
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

    public function soumettreExam(Request $request, $id)
    {
        $user = auth()->user();
        if ($user->role !== 'etudiant') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $exam = Examen::with([
            'questions.choix',
            'parties.questions.choix'
        ])->findOrFail($id);

        $allQuestions = collect();
        if ($exam->parties && $exam->parties->count() > 0) {
            foreach ($exam->parties as $partie) {
                $allQuestions = $allQuestions->merge($partie->questions);
            }
        } else {
            $allQuestions = $exam->questions;
        }

        $answers = $request->input('answers', []);

        $session = SessionExamen::updateOrCreate(
            [
                'etudiant_id' => $user->id,
                'examen_id' => $exam->id,
            ],
            [
                'statut' => 'soumis',
                'fin_at' => now(),
            ]
        );

        foreach ($allQuestions as $question) {
            $answer = $answers[$question->id] ?? null;

            $reponseData = [
                'etudiant_id' => $user->id,
                'examen_id' => $exam->id,
                'question_id' => $question->id,
            ];

            if ($question->type === 'qcm') {
                $correctChoice = $question->choix->firstWhere('est_correct', true);
                $reponseData['choix_qcm_id'] = $answer ? (int) $answer : null;
                $reponseData['reponse_texte'] = null;
                $reponseData['note_attribuee'] = ($answer && $correctChoice && (int) $answer === $correctChoice->id)
                    ? $question->points : 0;
            } else {
                $reponseData['reponse_texte'] = $answer;
                $reponseData['choix_qcm_id'] = null;
                $reponseData['note_attribuee'] = null;
            }

            ExamenReponse::updateOrCreate(
                [
                    'etudiant_id' => $user->id,
                    'examen_id' => $exam->id,
                    'question_id' => $question->id,
                ],
                $reponseData
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Examen soumis avec succès.',
            'session_id' => $session->id,
        ]);
    }

    public function getMaSession($id)
    {
        $user = auth()->user();
        $session = SessionExamen::where('etudiant_id', $user->id)
            ->where('examen_id', $id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $session,
        ]);
    }

    public function bloquerSession(Request $request, $id)
    {
        $user = auth()->user();

        $session = SessionExamen::updateOrCreate(
            [
                'etudiant_id' => $user->id,
                'examen_id' => $id,
            ],
            [
                'statut' => 'bloque',
                'nb_sorties' => DB::raw('COALESCE(nb_sorties, 0) + 1'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Session bloquée.',
            'nb_sorties' => $session->fresh()->nb_sorties,
        ]);
    }

    public function getExamensPourCorrection()
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }
        
        $examens = Examen::where(function ($query) use ($user) {
                $query->where('formateur_id', $user->id)->orWhere('enseignant_id', $user->id);
            })
            ->with(['filiere:id,nom', 'groupe:id,nom'])
            ->get()
            ->map(function ($exam) {
                $exam->nb_soumis = SessionExamen::where('examen_id', $exam->id)
                    ->whereIn('statut', ['soumis', 'termine'])
                    ->count();
                $exam->nb_corriges = SessionExamen::where('examen_id', $exam->id)
                    ->where('statut', 'corrige')
                    ->count();
                return $exam;
            });
             
        return response()->json([
            'success' => true,
            'data' => $examens
        ]);
    }

    public function debloquerSession($id)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $session = SessionExamen::findOrFail($id);
        $session->update([
            'statut' => 'en_cours',
            'nb_sorties' => 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Session débloquée.']);
    }

    public function getEtudiantsReponses($exam_id, $groupe_id = null)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }
        
        $sessions = SessionExamen::where('examen_id', $exam_id)
            ->whereIn('statut', ['termine', 'soumis', 'corrige'])
            ->when($groupe_id, function ($query) use ($groupe_id) {
                $query->whereHas('etudiant', function ($query) use ($groupe_id) {
                    $query->where('groupe_id', $groupe_id);
                });
            })
            ->with(['etudiant:id,name,prenom,email,photo'])
            ->get();
             
        $data = $sessions->map(function ($session) {
            $responses = ExamenReponse::where('etudiant_id', $session->etudiant_id)
                ->where('examen_id', $session->examen_id)
                ->with(['question', 'choix'])
                ->get();
                 
            return [
                'session_id' => $session->id,
                'etudiant' => $session->etudiant,
                'statut' => $session->statut,
                'note_totale' => $session->note_totale,
                'responses' => $responses
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function noterReponsesQuestion(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|exists:sessions_examen,id',
            'etudiant_id' => 'required|exists:users,id',
            'examen_id' => 'required|exists:examens,id',
            'notes' => 'required|array',
        ]);

        $validator->after(function ($validator) use ($request) {
            foreach ($request->input('notes', []) as $key => $noteData) {
                if (is_array($noteData)) {
                    if (!isset($noteData['question_id'])) {
                        $validator->errors()->add("notes.$key.question_id", 'Le champ question_id est requis.');
                    }
                    if (!array_key_exists('note', $noteData)) {
                        $validator->errors()->add("notes.$key.note", 'Le champ note est requis.');
                    } elseif (!is_numeric($noteData['note']) || $noteData['note'] < 0) {
                        $validator->errors()->add("notes.$key.note", 'La note doit être un nombre supérieur ou égal à 0.');
                    }
                } elseif (!is_numeric($noteData) || $noteData < 0) {
                    $validator->errors()->add("notes.$key", 'La note doit être un nombre supérieur ou égal à 0.');
                }
            }
        });

        $validated = $validator->validate();
        
        $etudiant_id = $validated['etudiant_id'];
        $examen_id = $validated['examen_id'];
        
        foreach ($validated['notes'] as $key => $noteData) {
            if (is_array($noteData) && isset($noteData['question_id'])) {
                $questionId = $noteData['question_id'];
                $noteVal = $noteData['note'];
            } else {
                $questionId = $key;
                $noteVal = $noteData;
            }

            ExamenReponse::updateOrCreate(
                ['etudiant_id' => $etudiant_id, 'examen_id' => $examen_id, 'question_id' => $questionId],
                ['note_attribuee' => $noteVal]
            );
        }
        
        // Calculate Note Totale
        $totalNotes = ExamenReponse::where('etudiant_id', $etudiant_id)
            ->where('examen_id', $examen_id)
            ->sum('note_attribuee');
             
        // Update SessionExamen
        $session = SessionExamen::find($validated['session_id']);
        $session->update([
            'note_totale' => $totalNotes,
            'statut' => 'corrige'
        ]);
        
        // Auto-Recalculate Student Cumulative Average:
        // average of all graded exam sessions they have completed (statut = 'corrige')
        $average = SessionExamen::where('etudiant_id', $etudiant_id)
            ->where('statut', 'corrige')
            ->avg('note_totale');
             
        if ($average !== null) {
            $student = User::find($etudiant_id);
            $student->update(['moyenne' => round($average, 2)]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Correction enregistrée avec succès.',
            'data' => [
                'note_totale' => $totalNotes
            ]
        ]);
    }
}
