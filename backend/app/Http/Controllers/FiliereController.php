<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Filiere;

class FiliereController extends Controller
{
    public function index()
    {
        return response()->json(Filiere::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:150',
            'description' => 'nullable|string',
        ]);

        $filiere = Filiere::create($validated);

        return response()->json($filiere, 201);
    }

    public function destroy($id)
    {
        $filiere = Filiere::findOrFail($id);
        $filiere->delete();

        return response()->json(['message' => 'Filière supprimée avec succès']);
    }
}