<?php

namespace Database\Seeders;

use App\Models\Filiere;
use Illuminate\Database\Seeder;

class FiliereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $filieres = [
            ['nom' => 'Développement Digital', 'description' => 'Formation en développement web et mobile.'],
            ['nom' => 'Infrastructure Digitale', 'description' => 'Formation en réseaux et systèmes.'],
            ['nom' => 'Gestion des Entreprises', 'description' => 'Formation en management et comptabilité.'],
            ['nom' => 'Design Graphique', 'description' => 'Formation en création visuelle et multimédia.'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::create($filiere);
        }
    }
}
