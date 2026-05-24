<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Examen;
use App\Models\Note;
use App\Models\User;
use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class FormateurController extends Controller
{
    public function getProfil()
    {
        $user = auth()->user();
        
        $stats = [
            'cours_count' => Course::where('enseignant_id', $user->id)->orWhere('formateur_id', $user->id)->count(),
            'examens_count' => Examen::where('enseignant_id', $user->id)->orWhere('formateur_id', $user->id)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'stats' => $stats
            ],
            'message' => 'Profil récupéré avec succès.'
        ]);
    }

    public function updateProfil(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'photo' => 'nullable|string', // URL or base64 or file
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Profil mis à jour avec succès.'
        ]);
    }

    public function getStats()
    {
        $userId = auth()->id();

        // 1. Cours postés
        $nbCours = Course::where('enseignant_id', $userId)
            ->orWhere('formateur_id', $userId)
            ->count();

        // 2. Examens créés
        $nbExamens = Examen::where('enseignant_id', $userId)
            ->orWhere('formateur_id', $userId)
            ->count();

        // 3. Groupes et Étudiants
        $groupeIds = Course::where('enseignant_id', $userId)
            ->orWhere('formateur_id', $userId)
            ->pluck('groupe_id')
            ->merge(
                Examen::where('enseignant_id', $userId)
                    ->orWhere('formateur_id', $userId)
                    ->pluck('groupe_id')
            )
            ->unique()
            ->filter()
            ->values();

        if ($groupeIds->isEmpty()) {
            $nbEtudiants = User::where('role', 'etudiant')->count();
        } else {
            $groupeNoms = Groupe::whereIn('id', $groupeIds)->pluck('nom');
            $nbEtudiants = User::where('role', 'etudiant')
                ->where(function($q) use ($groupeIds, $groupeNoms) {
                    $q->whereIn('id', function($sub) use ($groupeIds) {
                        $sub->select('etudiant_id')->from('etudiant_groupe')->whereIn('groupe_id', $groupeIds);
                    })->orWhereIn('groupe', $groupeNoms);
                })
                ->distinct()
                ->count();
        }

        // 4. Moyenne générale de la classe (de toutes les notes données par ce formateur)
        $moyenneClasse = Note::where('formateur_id', $userId)->avg('note') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'nb_cours' => $nbCours,
                'nb_examens' => $nbExamens,
                'nb_etudiants' => $nbEtudiants,
                'moyenne_classe' => round($moyenneClasse, 2)
            ],
            'message' => 'Statistiques récupérées avec succès.'
        ]);
    }

    public function getMesEtudiants()
    {
        $userId = auth()->id();

        // Get groups taught by this formateur
        $groupeIds = Course::where('enseignant_id', $userId)
            ->orWhere('formateur_id', $userId)
            ->pluck('groupe_id')
            ->merge(
                Examen::where('enseignant_id', $userId)
                    ->orWhere('formateur_id', $userId)
                    ->pluck('groupe_id')
            )
            ->unique()
            ->filter()
            ->values();

        // Fallback to all groups if none taught yet
        if ($groupeIds->isEmpty()) {
            $groupes = Groupe::with('filiere')->get();
        } else {
            $groupes = Groupe::whereIn('id', $groupeIds)->with('filiere')->get();
        }

        $data = [];
        foreach ($groupes as $groupe) {
            $students = User::where('role', 'etudiant')
                ->where(function($query) use ($groupe) {
                    $query->whereIn('id', function($sub) use ($groupe) {
                        $sub->select('etudiant_id')
                            ->from('etudiant_groupe')
                            ->where('groupe_id', $groupe->id);
                    })->orWhere('groupe', $groupe->nom);
                })
                ->distinct()
                ->get();

            $studentList = $students->map(function($student) {
                // Return dynamic details
                $moyenne = Note::where('etudiant_id', $student->id)->avg('note') ?? 0;
                
                // Get all accessed courses
                // Since accessed courses can be simulated/stored, we can fetch all courses in their filiere/group
                $coursConsultes = Course::where('filiere_id', $student->filiere_id)
                    ->orWhere('groupe_id', $student->groupe_id)
                    ->get()
                    ->map(function($c) use ($student) {
                        $note = Note::where('etudiant_id', $student->id)->where('cours_id', $c->id)->first();
                        return [
                            'id' => $c->id,
                            'titre' => $c->titre,
                            'consulted_at' => $c->created_at->toDateTimeString(),
                            'note' => $note ? $note->note : null,
                            'commentaire' => $note ? $note->commentaire : null,
                        ];
                    });

                // Get exam results
                $notesExamen = Note::where('etudiant_id', $student->id)
                    ->whereNotNull('examen_id')
                    ->with('examen')
                    ->get()
                    ->map(function($n) {
                        return [
                            'id' => $n->id,
                            'examen_id' => $n->examen_id,
                            'examen_titre' => $n->examen ? $n->examen->titre : 'Examen Supprimé',
                            'note' => $n->note,
                            'commentaire' => $n->commentaire,
                            'date' => $n->created_at->toDateTimeString()
                        ];
                    });

                return [
                    'id' => $student->id,
                    'nom' => $student->name,
                    'prenom' => $student->prenom,
                    'photo' => $student->photo,
                    'email' => $student->email,
                    'telephone' => $student->telephone,
                    'annee' => $student->annee,
                    'filiere' => $student->filiere,
                    'groupe' => $student->groupe,
                    'moyenne_generale' => round($moyenne, 2),
                    'derniere_connexion' => 'Récemment',
                    'cours_consultes' => $coursConsultes,
                    'examens' => $notesExamen
                ];
            });

            $data[] = [
                'id' => $groupe->id,
                'nom' => $groupe->nom,
                'filiere' => $groupe->filiere ? $groupe->filiere->nom : 'Général',
                'annee' => '1ère/2ème',
                'nb_etudiants' => $students->count(),
                'etudiants' => $studentList
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Étudiants récupérés avec succès.'
        ]);
    }
}
