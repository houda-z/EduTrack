<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\CheckRole;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware(CheckRole::class . ':etudiant,prof,admin')
        ->get('/dashboard/etudiant', fn() => inertia('Dashboard/Etudiant'))
        ->name('dashboard.etudiant');

    Route::middleware(CheckRole::class . ':prof,admin')
        ->get('/dashboard/prof', fn() => inertia('Dashboard/Prof'))
        ->name('dashboard.prof');

    Route::middleware(CheckRole::class . ':admin')
        ->get('/dashboard/admin', fn() => inertia('Dashboard/Admin'))
        ->name('dashboard.admin');
});
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
