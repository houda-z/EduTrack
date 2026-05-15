<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Filiere;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un enseignant de test si aucun n'existe
        $enseignant = User::firstOrCreate(
            ['email' => 'prof@edutrack.com'],
            [
                'name' => 'Professeur',
                'prenom' => 'X',
                'password' => Hash::make('password'),
                'role' => 'enseignant'
            ]
        );

        $filiereDev = Filiere::where('nom', 'Développement Digital')->first();
        $filiereInfra = Filiere::where('nom', 'Infrastructure Digitale')->first();

        if ($filiereDev) {
            Course::create([
                'titre' => 'React.js Avancé',
                'contenu' => 'Apprendre les hooks, le context et Redux.',
                'enseignant_id' => $enseignant->id,
                'filiere_id' => $filiereDev->id
            ]);
            Course::create([
                'titre' => 'Laravel API Mastery',
                'contenu' => 'Construire des API robustes avec Laravel 11.',
                'enseignant_id' => $enseignant->id,
                'filiere_id' => $filiereDev->id
            ]);
        }

        if ($filiereInfra) {
            Course::create([
                'titre' => 'Administration Linux',
                'contenu' => 'Gestion des serveurs et sécurité.',
                'enseignant_id' => $enseignant->id,
                'filiere_id' => $filiereInfra->id
            ]);
        }
    }
}
