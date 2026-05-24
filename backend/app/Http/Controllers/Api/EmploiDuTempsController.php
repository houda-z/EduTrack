<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    public function index(Request $request)
    {
        $groupeId = $request->query('groupe_id');

        $query = EmploiDuTemps::with(['formateur', 'groupe']);
        
        if ($groupeId) {
            $query->where('groupe_id', $groupeId);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
            'message' => 'Emploi du temps récupéré avec succès.'
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'groupe_id' => 'required|exists:groupes,id',
            'titre' => 'required|string|max:255',
            'jour' => 'required|in:lundi,mardi,mercredi,jeudi,vendredi',
            'heure_debut' => 'required', // format time (e.g. HH:MM)
            'heure_fin' => 'required',
            'salle' => 'nullable|string|max:100',
            'type' => 'required|in:cours,exam,tp',
        ]);

        $session = EmploiDuTemps::create([
            'formateur_id' => $user->id,
            'groupe_id' => $validated['groupe_id'],
            'titre' => $validated['titre'],
            'jour' => $validated['jour'],
            'heure_debut' => $validated['heure_debut'],
            'heure_fin' => $validated['heure_fin'],
            'salle' => $validated['salle'] ?? '',
            'type' => $validated['type'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $session,
            'message' => 'Session ajoutée avec succès.'
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $session = EmploiDuTemps::findOrFail($id);

        if ($session->formateur_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'groupe_id' => 'required|exists:groupes,id',
            'titre' => 'required|string|max:255',
            'jour' => 'required|in:lundi,mardi,mercredi,jeudi,vendredi',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
            'salle' => 'nullable|string|max:100',
            'type' => 'required|in:cours,exam,tp',
        ]);

        $session->update($validated);

        return response()->json([
            'success' => true,
            'data' => $session,
            'message' => 'Session modifiée avec succès.'
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $session = EmploiDuTemps::findOrFail($id);

        if ($session->formateur_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $session->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Session supprimée avec succès.'
        ]);
    }
}
