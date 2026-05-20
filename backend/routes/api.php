<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/filieres', [FiliereController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

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
});