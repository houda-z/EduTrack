<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MoyenneService;
use Illuminate\Http\Request;

class EtudiantMoyenneController extends Controller
{
    protected MoyenneService $moyenneService;

    public function __construct(MoyenneService $moyenneService)
    {
        $this->moyenneService = $moyenneService;
    }

    /**
     * GET /api/etudiant/{id}/moyenne
     *
     * Returns the full dynamic moyenne breakdown for a student.
     * Accessible by the student themselves (own data) or by enseignant/admin.
     *
     * Response shape:
     * {
     *   "success": true,
     *   "data": {
     *     "modules": [
     *       {
     *         "cours_id": 1,
     *         "cours_titre": "React Avancé",
     *         "examens": [
     *           { "examen_id": 3, "titre": "Contrôle 1", "coefficient": 2, "note": 16.5, "commentaire": "...", "formateur": {...} }
     *         ],
     *         "moyenne": 16.5
     *       }
     *     ],
     *     "moyenne_generale": 15.2,
     *     "total_notes": 4
     *   }
     * }
     */
    public function show(Request $request, int $id)
    {
        $authUser = $request->user();

        // Authorization: student can only read their own moyenne
        if ($authUser->role === 'etudiant' && $authUser->id !== $id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé.'
            ], 403);
        }

        // Confirm the target student exists
        $student = User::where('id', $id)->where('role', 'etudiant')->first();
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Étudiant introuvable.'
            ], 404);
        }

        $data = $this->moyenneService->calculateForStudent($id);

        return response()->json([
            'success' => true,
            'data'    => $data,
            'message' => 'Moyenne calculée avec succès.'
        ]);
    }
}
