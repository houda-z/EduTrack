<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;

class ModuleSystemSeeder extends Seeder
{
    public function run(): void
    {
        $filiere = Filiere::find(2);

        if (! $filiere) {
            $this->command->warn('Filiere id=2 not found. Seeder skipped.');
            return;
        }

        $modules = [
            ['nom' => 'Développement Backend - Laravel', 'code' => 'M201'],
            ['nom' => 'Développement Frontend - React', 'code' => 'M202'],
            ['nom' => 'Bases de données & DevOps', 'code' => 'M203'],
        ];

        $moduleIds = [];
        foreach ($modules as $moduleData) {
            $module = Module::updateOrCreate(
                ['code' => $moduleData['code']],
                ['nom' => $moduleData['nom'], 'filiere_id' => $filiere->id]
            );

            $moduleIds[] = $module->id;
        }

        $formateur = User::where('id', 8)->where('role', 'enseignant')->first();

        if (! $formateur) {
            $this->command->warn('Formateur id=8 not found or not enseignant. Seeder skipped.');
            return;
        }

        $formateur->modules()->syncWithoutDetaching($moduleIds);
    }
}
