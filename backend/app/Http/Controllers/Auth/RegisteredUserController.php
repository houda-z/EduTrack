<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'prenom'   => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'filiere'  => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'annee'    => 'nullable|in:1ère année,2ème année',
            'groupe'   => 'required|string|max:255',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'prenom'   => $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'filiere'  => $request->filiere,
            'groupe'   => $request->groupe,
            'telephone' => $request->telephone,
            'annee'    => $request->annee,
            'role'     => 'etudiant',
        ]);

        event(new Registered($user));

        Auth::login($user);

        $role = $user->role;

        return match($role) {
            'admin'      => redirect()->route('dashboard.admin'),
            'enseignant' => redirect()->route('dashboard.enseignant'),
            default      => redirect()->route('dashboard.etudiant'),
        };
    }
}