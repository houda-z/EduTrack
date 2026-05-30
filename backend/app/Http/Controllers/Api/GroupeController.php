<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Groupe;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    public function index()
    {
        return response()->json(Groupe::with('filiere')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'filiere_id' => 'required|exists:filieres,id',
        ]);

        $groupe = Groupe::create($validated);
        
        // Return with filiere relationship loaded
        $groupe->load('filiere');

        return response()->json($groupe, 201);
    }

    public function destroy($id)
    {
        $groupe = Groupe::findOrFail($id);
        $groupe->delete();

        return response()->json(['message' => 'Groupe supprimé avec succès']);
    }
}
