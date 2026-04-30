<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;

class AuthController extends Controller
{
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $role = auth()->user()->role;

        return match($role) {
            'admin'      => redirect()->route('dashboard.admin'),
            'enseignant' => redirect()->route('dashboard.enseignant'),
            default      => redirect()->route('dashboard.etudiant'),
        };
    }
}