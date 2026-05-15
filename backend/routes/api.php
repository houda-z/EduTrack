<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::get('/filieres', [FiliereController::class, 'index']);
Route::get('/cours', [CourseController::class, 'index']);
Route::get('/cours/filiere/{id}', [CourseController::class, 'byFiliere']);
