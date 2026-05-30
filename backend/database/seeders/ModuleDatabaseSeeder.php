<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;

class ModuleDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = Filiere::all();
        if ($filieres->isEmpty()) {
            return;
        }

        $templates = [
            ['nom' => 'Architecture des Systèmes', 'code' => 'ARCH'],
            ['nom' => 'Programmation Avancée', 'code' => 'PROG'],
            ['nom' => 'Gestion de Projet', 'code' => 'GEST'],
            ['nom' => 'Sécurité des Applications', 'code' => 'SECU'],
        ];

        $moduleIds = [];

        foreach ($filieres as $filiere) {
            $suffix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]+/', '', $filiere->nom), 0, 5));

            foreach ($templates as $template) {
                $module = Module::firstOrCreate(
                    ['code' => $template['code'] . '_' . $suffix],
                    [
                        'nom' => "{$template['nom']} {$filiere->nom}",
                        'filiere_id' => $filiere->id,
                    ]
                );

                $moduleIds[] = $module->id;
            }
        }

        $enseignants = User::where('role', 'enseignant')->get();
        foreach ($enseignants as $enseignant) {
            $enseignant->modules()->syncWithoutDetaching($moduleIds);
        }
    }
}
