<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        // On récupère tous les cours avec les infos de l'enseignant et de la filière
        return response()->json(Course::with(['enseignant', 'filiere'])->get());
    }

    public function byFiliere($filiereId)
    {
        return response()->json(Course::where('filiere_id', $filiereId)->with('enseignant')->get());
    }
}
