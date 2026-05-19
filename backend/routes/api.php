<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\Auth\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/filieres', [FiliereController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);
});