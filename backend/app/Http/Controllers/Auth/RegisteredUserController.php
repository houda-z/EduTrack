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

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'prenom'   => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role'     => 'required|in:etudiant,enseignant',
            'filiere'  => 'nullable|string|max:255',
            'groupe'   => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'prenom'   => $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'filiere'  => $request->filiere,
            'groupe'   => $request->groupe,
            'role'     => $request->role,
        ]);

        event(new Registered($user));

        Auth::login($user);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Utilisateur créé avec succès',
                'user' => $user,
                'redirect' => match($user->role) {
                    'admin'      => '/admin/dashboard',
                    'enseignant' => '/enseignant/dashboard',
                    default      => '/etudiant/dashboard',
                }
            ], 201);
        }

        return match($user->role) {
            'admin'      => redirect()->route('dashboard.admin'),
            'enseignant' => redirect()->route('dashboard.enseignant'),
            default      => redirect()->route('dashboard.etudiant'),
        };
    }
}