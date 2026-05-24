<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/filieres', [FiliereController::class, 'index']);
Route::get('/groupes', [App\Http\Controllers\Api\GroupeController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // General Auth Routes for both student & teacher
    Route::get('/cours', [App\Http\Controllers\Api\CoursController::class, 'index']);
    Route::get('/examens', [App\Http\Controllers\Api\ExamenController::class, 'index']);
    Route::get('/emploi-du-temps', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'index']);
    
    // Commentaires — accessible par tous (etudiant + enseignant)
    Route::get('/cours/{id}/commentaires', [App\Http\Controllers\Api\CoursController::class, 'getCommentaires']);
    Route::post('/cours/{id}/commentaires', [App\Http\Controllers\Api\CoursController::class, 'addCommentaire']);

    // Student Dashboard Routes
    Route::prefix('student')->group(function () {
        Route::get('/stats', [App\Http\Controllers\Api\StudentController::class, 'getDashboardStats']);
        Route::get('/courses', [App\Http\Controllers\Api\StudentController::class, 'getCourses']);
        Route::get('/exams', [App\Http\Controllers\Api\StudentController::class, 'getExams']);
        Route::get('/grades', [App\Http\Controllers\Api\StudentController::class, 'getGrades']);
        Route::get('/profile', [App\Http\Controllers\Api\StudentController::class, 'getProfile']);
        Route::post('/profile/update', [App\Http\Controllers\Api\StudentController::class, 'updateProfile']);
        Route::post('/exams/submit', [App\Http\Controllers\Api\StudentController::class, 'submitExam']);
    });

    // Formateur (Enseignant) Routes
    Route::middleware('role:enseignant')->group(function () {
        // Profil / Stats
        Route::get('/formateur/profil', [App\Http\Controllers\Api\FormateurController::class, 'getProfil']);
        Route::put('/formateur/profil', [App\Http\Controllers\Api\FormateurController::class, 'updateProfil']);
        Route::get('/formateur/stats', [App\Http\Controllers\Api\FormateurController::class, 'getStats']);
        Route::get('/formateur/mes-etudiants', [App\Http\Controllers\Api\FormateurController::class, 'getMesEtudiants']);

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
        Route::get('/notes/etudiant/{id}', [App\Http\Controllers\Api\NoteController::class, 'getStudentNotes']);
        Route::put('/notes/{id}', [App\Http\Controllers\Api\NoteController::class, 'update']);

        // Emploi du temps Write Operations
        Route::post('/emploi-du-temps', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'store']);
        Route::put('/emploi-du-temps/{id}', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'update']);
        Route::delete('/emploi-du-temps/{id}', [App\Http\Controllers\Api\EmploiDuTempsController::class, 'destroy']);
    });
});