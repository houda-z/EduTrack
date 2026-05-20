<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Examen;
use App\Models\Note;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function getDashboardStats()
    {
        $user = Auth::user();
        
        // Simuler des statistiques pour le moment
        return response()->json([
            'average' => Note::where('etudiant_id', $user->id)->avg('valeur') ?? 0,
            'completed_exams' => Note::where('etudiant_id', $user->id)->count(),
            'upcoming_exams' => Examen::where('statut', 'actif')->count(),
            'current_courses' => Course::count(),
        ]);
    }

    public function getCourses()
    {
        $user = Auth::user();
        // Dans une vraie app, on filtrerait par filiere_id de l'utilisateur
        $courses = Course::with('enseignant')->get();
        
        return response()->json($courses);
    }

    public function getExams()
    {
        $user = Auth::user();
        $exams = Examen::with(['enseignant', 'groupe'])->get();
        
        return response()->json($exams);
    }

    public function getGrades()
    {
        $user = Auth::user();
        $grades = Note::with('examen')->where('etudiant_id', $user->id)->get();
        
        return response()->json($grades);
    }

    public function getProfile()
    {
        return response()->json(Auth::user());
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $user->update($request->only(['telephone', 'email']));
        
        return response()->json(['message' => 'Profil mis à jour successfully', 'user' => $user]);
    }

    public function submitExam(Request $request)
    {
        // Logique de soumission avec sécurité
        // On pourrait enregistrer les incidents de triche ici
        return response()->json(['message' => 'Examen soumis avec succès']);
    }
}
