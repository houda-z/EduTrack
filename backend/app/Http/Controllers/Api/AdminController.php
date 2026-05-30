<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Filiere;
use App\Models\Groupe;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Fetch general system statistics.
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $totalEtudiants = User::where('role', 'etudiant')->count();
        $totalEnseignants = User::where('role', 'enseignant')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalFilieres = Filiere::count();
        $totalGroupes = Groupe::count();

        return response()->json([
            'total_users' => $totalUsers,
            'total_etudiants' => $totalEtudiants,
            'total_enseignants' => $totalEnseignants,
            'total_admins' => $totalAdmins,
            'total_filieres' => $totalFilieres,
            'total_groupes' => $totalGroupes,
        ]);
    }

    /**
     * Get all users in the system.
     */
    public function getUsers()
    {
        return response()->json(User::all());
    }

    /**
     * Update a user's role.
     */
    public function updateUserRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:admin,enseignant,etudiant',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Rôle de l\'utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
