<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/filieres', [FiliereController::class, 'index']);
Route::get('/groupes', [App\Http\Controllers\Api\GroupeController::class, 'index']);
Route::get('/emploi-du-temps/config', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'config']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // General Auth Routes for both student & teacher
    Route::get('/cours', [App\Http\Controllers\Api\CoursController::class, 'index']);
    Route::get('/examens', [App\Http\Controllers\Api\ExamenController::class, 'index']);
    Route::get('/examens/{id}', [App\Http\Controllers\Api\ExamenController::class, 'show']);
    Route::post('/examens/{id}/soumettre', [App\Http\Controllers\Api\ExamenController::class, 'soumettreExam']);
    Route::get('/emploi-du-temps', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'index']);

    
    
    // Commentaires — accessible par tous (etudiant + enseignant)
    Route::get('/cours/{id}/commentaires', [App\Http\Controllers\Api\CoursController::class, 'getCommentaires']);
    Route::post('/cours/{id}/commentaires', [App\Http\Controllers\Api\CoursController::class, 'addCommentaire']);
    Route::get('/cours/{id}/fichiers/{fichierId}/download', [App\Http\Controllers\Api\CoursController::class, 'downloadFichier']);

    // Student Dashboard Routes
    Route::prefix('student')->group(function () {
        Route::get('/stats', [App\Http\Controllers\Api\StudentController::class, 'getDashboardStats']);
        Route::get('/courses', [App\Http\Controllers\Api\StudentController::class, 'getCourses']);
        Route::get('/exams', [App\Http\Controllers\Api\StudentController::class, 'getExams']);
        Route::get('/grades', [App\Http\Controllers\Api\StudentController::class, 'getGrades']);
        Route::get('/profile', [App\Http\Controllers\Api\StudentController::class, 'getProfile']);
        Route::post('/profile/update', [App\Http\Controllers\Api\StudentController::class, 'updateProfile']);
        Route::post('/exams/submit', [App\Http\Controllers\Api\StudentController::class, 'submitExam']);
        Route::get('/examens/{id}', [App\Http\Controllers\Api\ExamenController::class, 'show']);
    });

    // Formateur (Enseignant) Routes
    Route::get('/formateur/examens-correction', [App\Http\Controllers\Api\ExamenController::class, 'getExamensPourCorrection']);
    Route::get('/formateur/examens/{exam_id}/groupes/{groupe_id}/etudiants', [App\Http\Controllers\Api\ExamenController::class, 'getEtudiantsReponses']);
    Route::get('/formateur/examens/{exam_id}/etudiants', [App\Http\Controllers\Api\ExamenController::class, 'getEtudiantsReponses']);
    Route::post('/formateur/reponses/noter', [App\Http\Controllers\Api\ExamenController::class, 'noterReponsesQuestion']);
    Route::post('/examens/{id}/bloquer-session', [App\Http\Controllers\Api\ExamenController::class, 'bloquerSession']);
    Route::get('/examens/{id}/ma-session', [App\Http\Controllers\Api\ExamenController::class, 'getMaSession']);
    Route::get('/notes/etudiant/{id}', [App\Http\Controllers\Api\NoteController::class, 'getStudentNotes']);

    Route::middleware('role:enseignant')->group(function () {
        // Profil / Stats
        Route::get('/formateur/profil', [App\Http\Controllers\Api\FormateurController::class, 'getProfil']);
        Route::put('/formateur/profil', [App\Http\Controllers\Api\FormateurController::class, 'updateProfil']);
        Route::get('/formateur/stats', [App\Http\Controllers\Api\FormateurController::class, 'getStats']);
        Route::get('/formateur/mes-etudiants', [App\Http\Controllers\Api\FormateurController::class, 'getMesEtudiants']);

        Route::patch('/examens/{id}/statut', [App\Http\Controllers\Api\ExamenController::class, 'updateStatut']);
        
        // Course Write Operations
        Route::post('/cours', [App\Http\Controllers\Api\CoursController::class, 'store']);
        Route::put('/cours/{id}', [App\Http\Controllers\Api\CoursController::class, 'update']);
        Route::delete('/cours/{id}', [App\Http\Controllers\Api\CoursController::class, 'destroy']);
        Route::post('/cours/{id}/fichiers', [App\Http\Controllers\Api\CoursController::class, 'uploadFichiers']);
        Route::delete('/cours/{id}/fichiers/{fichierId}', [App\Http\Controllers\Api\CoursController::class, 'deleteFichier']);
        Route::get('/cours/{id}/reponses', [App\Http\Controllers\Api\CoursController::class, 'getReponses']);

        // Exam Write Operations
        Route::post('/examens', [App\Http\Controllers\Api\ExamenController::class, 'store']);
        Route::put('/examens/{id}', [App\Http\Controllers\Api\ExamenController::class, 'update']);
        Route::delete('/examens/{id}', [App\Http\Controllers\Api\ExamenController::class, 'destroy']);
        Route::post('/examens/{id}/questions', [App\Http\Controllers\Api\ExamenController::class, 'addQuestions']);
        Route::get('/examens/{id}/resultats', [App\Http\Controllers\Api\ExamenController::class, 'getResultats']);

        // Notes / Grading
        Route::post('/notes', [App\Http\Controllers\Api\NoteController::class, 'store']);
        Route::put('/notes/{id}', [App\Http\Controllers\Api\NoteController::class, 'update']);
        Route::patch('/sessions/{id}/debloquer', [App\Http\Controllers\Api\ExamenController::class, 'debloquerSession']);

        Route::get('/formateur/mes-modules', [App\Http\Controllers\Api\FormateurController::class, 'mesModules']);

        // Emploi du temps Write Operations
        Route::post('/emploi-du-temps', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'store']);
        Route::put('/emploi-du-temps/{id}', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'update']);
        Route::delete('/emploi-du-temps/{id}', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'destroy']);
    });
});