<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursFichier;
use App\Models\Commentaire;
use App\Models\User;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CoursController extends Controller
{
    /**
     * GET /api/cours
     * Role-based filtering:
     *  - etudiant  → courses matching their filiere_id AND groupe_id (FK-first, string fallback)
     *  - enseignant → courses where formateur_id = auth user
     *  - admin     → all courses
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'etudiant') {
            $query = Course::with([
                'formateur:id,name,prenom',
                'filiere:id,nom',
                'groupe:id,nom',
                'fichiers',
                'commentaires.user:id,name,prenom',
            ]);

            // Prefer FK columns; fall back to string-name lookup for legacy accounts
            $filiereId = $user->filiere_id;
            $groupeId  = $user->groupe_id;

            if (!$filiereId && $user->filiere) {
                $filiere   = \App\Models\Filiere::where('nom', $user->filiere)->first();
                $filiereId = $filiere ? $filiere->id : null;
            }
            if (!$groupeId && $user->groupe) {
                $groupe   = \App\Models\Groupe::where('nom', $user->groupe)->first();
                $groupeId = $groupe ? $groupe->id : null;
            }

            if ($filiereId) {
                $query->where('filiere_id', $filiereId);
            }
            if ($groupeId) {
                $query->where(function ($q) use ($groupeId) {
                    // courses targeting this group OR courses with no group (open to all)
                    $q->where('groupe_id', $groupeId)->orWhereNull('groupe_id');
                });
            }

            $courses = $query->orderByDesc('created_at')->get();

        } elseif ($user->role === 'enseignant') {
            $courses = Course::where('formateur_id', $user->id)
                ->orWhere('enseignant_id', $user->id)
                ->with(['filiere:id,nom', 'groupe:id,nom', 'fichiers', 'commentaires'])
                ->orderByDesc('created_at')
                ->get();
        } else {
            $courses = Course::with([
                'formateur:id,name,prenom',
                'filiere:id,nom',
                'groupe:id,nom',
                'fichiers',
                'commentaires.user:id,name,prenom',
            ])->orderByDesc('created_at')->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $courses,
            'message' => 'Cours récupérés avec succès.'
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'titre'      => 'required|string|max:255',
            'description'=> 'nullable|string',
            'contenu'    => 'nullable|string',
            'filiere_id' => 'required|exists:filieres,id',
            'groupe_id'  => 'nullable|exists:groupes,id',
        ]);

        $course = Course::create([
            'titre'        => $validated['titre'],
            'description'  => $validated['description'] ?? '',
            'contenu'      => $validated['contenu'] ?? '',
            'filiere_id'   => $validated['filiere_id'],
            'groupe_id'    => $validated['groupe_id'] ?? null,
            'enseignant_id'=> $user->id,
            'formateur_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $course->load(['filiere', 'groupe', 'fichiers']),
            'message' => 'Cours créé avec succès.'
        ]);
    }

    public function update(Request $request, $id)
    {
        $user   = auth()->user();
        $course = Course::findOrFail($id);

        if ($course->formateur_id !== $user->id && $course->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'titre'      => 'required|string|max:255',
            'description'=> 'nullable|string',
            'contenu'    => 'nullable|string',
            'filiere_id' => 'required|exists:filieres,id',
            'groupe_id'  => 'nullable|exists:groupes,id',
        ]);

        $course->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $course->load(['filiere', 'groupe', 'fichiers']),
            'message' => 'Cours mis à jour avec succès.'
        ]);
    }

    public function destroy($id)
    {
        $user   = auth()->user();
        $course = Course::findOrFail($id);

        if ($course->formateur_id !== $user->id && $course->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        foreach ($course->fichiers as $fichier) {
            if ($fichier->chemin && !str_starts_with($fichier->chemin, 'http')) {
                Storage::delete($fichier->chemin);
            }
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Cours supprimé avec succès.'
        ]);
    }

    public function uploadFichiers(Request $request, $id)
    {
        $user   = auth()->user();
        $course = Course::findOrFail($id);

        if ($course->formateur_id !== $user->id && $course->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        if ($request->hasFile('fichier')) {
            $request->validate(['fichier' => 'required|file|max:10240|mimes:pdf,mp4,mov,avi,jpg,png,jpeg']);

            $file         = $request->file('fichier');
            $originalName = $file->getClientOriginalName();
            $path         = $file->storeAs("public/cours/{$id}", $originalName);

            $ext  = strtolower($file->getClientOriginalExtension());
            $type = match(true) {
                $ext === 'pdf'                       => 'pdf',
                in_array($ext, ['mp4','mov','avi'])  => 'video',
                in_array($ext, ['jpg','jpeg','png']) => 'image',
                default                              => 'lien',
            };

            $fichier = $course->fichiers()->create([
                'nom'   => $originalName,
                'chemin'=> $path,
                'type'  => $type,
                'url'   => Storage::url($path),
            ]);
        } else {
            $validated = $request->validate([
                'nom'  => 'required|string|max:255',
                'url'  => 'required|url',
                'type' => 'required|in:pdf,video,lien,image',
            ]);

            $fichier = $course->fichiers()->create([
                'nom'   => $validated['nom'],
                'chemin'=> $validated['url'],
                'type'  => $validated['type'],
                'url'   => $validated['url'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => $fichier,
            'message' => 'Fichier ajouté avec succès.'
        ]);
    }

    public function deleteFichier($id, $fichierId)
    {
        $user    = auth()->user();
        $course  = Course::findOrFail($id);
        $fichier = CoursFichier::findOrFail($fichierId);

        if ($course->formateur_id !== $user->id && $course->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        if ($fichier->chemin && !str_starts_with($fichier->chemin, 'http')) {
            Storage::delete($fichier->chemin);
        }

        $fichier->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Fichier supprimé avec succès.'
        ]);
    }

    /**
     * GET /api/cours/{id}/reponses
     * Returns students in the course's group with their notes.
     */
    public function getReponses($id)
    {
        $user   = auth()->user();
        $course = Course::findOrFail($id);

        if ($course->formateur_id !== $user->id && $course->enseignant_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $students = User::where('role', 'etudiant')
            ->where(function ($query) use ($course) {
                if ($course->groupe_id) {
                    $query->where('groupe_id', $course->groupe_id)
                        ->orWhereIn('id', function ($sub) use ($course) {
                            $sub->select('etudiant_id')->from('etudiant_groupe')
                                ->where('groupe_id', $course->groupe_id);
                        });
                } else {
                    $query->where('filiere_id', $course->filiere_id)
                        ->orWhereIn('id', function ($sub) use ($course) {
                            $sub->select('etudiant_id')->from('etudiant_groupe')
                                ->whereIn('groupe_id', function ($sub2) use ($course) {
                                    $sub2->select('id')->from('groupes')
                                        ->where('filiere_id', $course->filiere_id);
                                });
                        });
                }
            })
            ->distinct()
            ->get();

        $data = $students->map(function ($student) use ($course) {
            $note = Note::where('etudiant_id', $student->id)
                ->where('cours_id', $course->id)
                ->first();

            return [
                'id'          => $student->id,
                'name'        => $student->name,
                'prenom'      => $student->prenom,
                'photo'       => $student->photo,
                'status'      => $note ? 'Noté' : 'Consulté',
                'note'        => $note ? $note->note : null,
                'commentaire' => $note ? $note->commentaire : null,
                'date_access' => $note ? $note->created_at->toDateTimeString() : 'Récemment',
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
            'message' => 'Réponses des étudiants récupérées avec succès.'
        ]);
    }

    /**
     * POST /api/cours/{id}/commentaires
     * Any authenticated user (étudiant or enseignant) can post a comment on a course.
     */
    public function addCommentaire(Request $request, $id)
    {
        $user   = auth()->user();
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'contenu' => 'required|string|max:1000',
        ]);

        $commentaire = Commentaire::create([
            'cours_id' => $course->id,
            'user_id'  => $user->id,
            'contenu'  => $validated['contenu'],
        ]);

        $commentaire->load('user:id,name,prenom,photo');

        return response()->json([
            'success' => true,
            'data'    => $commentaire,
            'message' => 'Commentaire ajouté avec succès.'
        ]);
    }

    public function getCommentaires($id)
{
    $commentaires = \App\Models\Commentaire::where('cours_id', $id)
        ->with(['user:id,name,prenom,photo'])
        ->orderByDesc('created_at')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $commentaires
    ]);
}

    
}
