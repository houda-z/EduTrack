<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    // Blade login
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

    // API Register
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'prenom'   => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'     => 'required|in:etudiant,enseignant,admin',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'prenom'   => $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'etudiant',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ], 201);
    }

    // API Login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;


        // Load filiere w groupe mn FK
        $filiereObj = $user->filiere_id ? \App\Models\Filiere::find($user->filiere_id) : null;
        $groupeObj  = $user->groupe_id  ? \App\Models\Groupe::find($user->groupe_id)   : null;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'         => $user->id,
                'name'       => $user->name,
                'prenom'     => $user->prenom,
                'email'      => $user->email,
                'role'       => $user->role,
                'filiere_id' => $user->filiere_id,
                'groupe_id'  => $user->groupe_id,
                'filiere'    => $filiereObj ? ['id' => $filiereObj->id, 'nom' => $filiereObj->nom] : null,
                'groupe'     => $groupeObj  ? ['id' => $groupeObj->id,  'nom' => $groupeObj->nom]  : null,
                'photo'      => $user->photo,
                'bio'        => $user->bio,
                'telephone'  => $user->telephone,
                'annee'      => $user->annee,
                'moyenne'    => $user->moyenne,
            ]
        ]);
    }

    // API Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout mzyan']);
    }

    // API Me
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['filiere', 'groupe']);

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'prenom'     => $user->prenom,
            'email'      => $user->email,
            'role'       => $user->role,
            'filiere_id' => $user->filiere_id,
            'groupe_id'  => $user->groupe_id,
            'filiere'    => $user->filiere ? ['id' => $user->filiere->id, 'nom' => $user->filiere->nom] : null,
            'groupe'     => $user->groupe  ? ['id' => $user->groupe->id,  'nom' => $user->groupe->nom]  : null,
            'photo'      => $user->photo,
            'bio'        => $user->bio,
            'telephone'  => $user->telephone,
            'annee'      => $user->annee,
            'moyenne'    => $user->moyenne,
        ]);
    }
}