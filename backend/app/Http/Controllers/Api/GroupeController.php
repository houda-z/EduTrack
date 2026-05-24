<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Groupe;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    public function index(Request $request)
    {
        $filiereId = $request->query('filiere_id');

        $query = Groupe::with('filiere');

        if ($filiereId) {
            $query->where('filiere_id', $filiereId);
        }

        $groupes = $query->get();

        return response()->json([
            'success' => true,
            'data' => $groupes,
            'message' => 'Groupes récupérés avec succès.'
        ]);
    }
}
