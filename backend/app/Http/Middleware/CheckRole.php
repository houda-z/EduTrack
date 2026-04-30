<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Vérifie si l'utilisateur est connecté
        if (!auth()->check()) {
            return redirect('/login');
        }

        // Vérifie si son rôle est autorisé
        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'Accès refusé : vous n\'avez pas la permission.');
        }

        return $next($request);
    }
}