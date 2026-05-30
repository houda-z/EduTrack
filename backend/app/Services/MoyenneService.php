<?php

namespace App\Services;

use App\Models\Note;
use App\Models\Course;
use App\Models\Examen;
use App\Models\User;

/**
 * MoyenneService
 *
 * Single source of truth for all moyenne calculations.
 * Hierarchy:
 *   1. Examen note  → raw score given by formateur (stored in notes table)
 *   2. Module (cours) moyenne → coefficient-weighted average of all examen notes for that cours
 *   3. Global moyenne → simple average of all module moyennes
 *
 * If an examen has no cours_id (standalone exam), it still contributes to the global
 * moyenne as its own "module" weighted by its coefficient.
 */
class MoyenneService
{
    /**
     * Calculate the full moyenne breakdown for a student.
     *
     * Returns:
     * [
     *   'modules' => [
     *     [
     *       'cours_id'    => int|null,
     *       'cours_titre' => string,
     *       'examens'     => [ ['examen_id', 'titre', 'coefficient', 'note', 'commentaire', 'formateur'], ... ],
     *       'moyenne'     => float   // coefficient-weighted avg for this module
     *     ],
     *     ...
     *   ],
     *   'moyenne_generale' => float,
     *   'total_notes'      => int,
     * ]
     */
    public function calculateForStudent(int $studentId): array
    {
        // Fetch all notes for this student, eager-load exam (with coefficient) and cours
        $notes = Note::where('etudiant_id', $studentId)
            ->with([
                'examen:id,titre,coefficient,cours_id',
                'cours:id,titre',
                'formateur:id,name,prenom',
            ])
            ->get();

        if ($notes->isEmpty()) {
            return [
                'modules'          => [],
                'moyenne_generale' => 0.0,
                'total_notes'      => 0,
            ];
        }

        // Group notes by module (cours).
        // Notes linked to an examen that has a cours_id → group by that cours_id.
        // Notes linked directly to a cours (no examen) → group by cours_id.
        // Standalone examen notes (no cours_id) → each gets its own pseudo-module.
        $modules = [];

        foreach ($notes as $note) {
            // Determine which module (cours) this note belongs to
            if ($note->examen_id && $note->examen) {
                $coursId    = $note->examen->cours_id;
                $coursTitle = $coursId && $note->examen->cours_id
                    ? optional(Course::find($coursId))->titre ?? $note->examen->titre
                    : $note->examen->titre;

                $key = $coursId ? "cours_{$coursId}" : "exam_{$note->examen_id}";

                if (!isset($modules[$key])) {
                    $modules[$key] = [
                        'cours_id'    => $coursId,
                        'cours_titre' => $coursTitle,
                        'examens'     => [],
                    ];
                }

                $modules[$key]['examens'][] = [
                    'examen_id'   => $note->examen_id,
                    'titre'       => $note->examen->titre,
                    'coefficient' => $note->examen->coefficient ?? 1,
                    'note'        => (float) $note->note,
                    'commentaire' => $note->commentaire,
                    'formateur'   => $note->formateur
                        ? [
                            'id'     => $note->formateur->id,
                            'name'   => $note->formateur->name,
                            'prenom' => $note->formateur->prenom,
                          ]
                        : null,
                ];
            } elseif ($note->cours_id) {
                // Direct course note (no examen) — coefficient defaults to 1
                $key = "cours_direct_{$note->cours_id}";

                if (!isset($modules[$key])) {
                    $coursTitle = $note->cours ? $note->cours->titre : "Cours #{$note->cours_id}";
                    $modules[$key] = [
                        'cours_id'    => $note->cours_id,
                        'cours_titre' => $coursTitle,
                        'examens'     => [],
                    ];
                }

                $modules[$key]['examens'][] = [
                    'examen_id'   => null,
                    'titre'       => 'Note de cours',
                    'coefficient' => 1,
                    'note'        => (float) $note->note,
                    'commentaire' => $note->commentaire,
                    'formateur'   => $note->formateur
                        ? [
                            'id'     => $note->formateur->id,
                            'name'   => $note->formateur->name,
                            'prenom' => $note->formateur->prenom,
                          ]
                        : null,
                ];
            }
        }

        // Calculate module moyenne (coefficient-weighted) and global moyenne
        $modulesResult  = [];
        $moduleMoyennes = [];

        foreach ($modules as $module) {
            $totalWeight = 0;
            $weightedSum = 0;

            foreach ($module['examens'] as $exam) {
                $coeff        = max(1, (int) $exam['coefficient']);
                $weightedSum += $exam['note'] * $coeff;
                $totalWeight += $coeff;
            }

            $moduleMoyenne = $totalWeight > 0
                ? round($weightedSum / $totalWeight, 2)
                : 0.0;

            $modulesResult[]  = array_merge($module, ['moyenne' => $moduleMoyenne]);
            $moduleMoyennes[] = $moduleMoyenne;
        }

        $moyenneGenerale = count($moduleMoyennes) > 0
            ? round(array_sum($moduleMoyennes) / count($moduleMoyennes), 2)
            : 0.0;

        return [
            'modules'          => $modulesResult,
            'moyenne_generale' => $moyenneGenerale,
            'total_notes'      => $notes->count(),
        ];
    }

    /**
     * Recalculate and persist the student's global moyenne to users.moyenne.
     * Called after every note create/update.
     */
    public function persistMoyenne(int $studentId): float
    {
        $result  = $this->calculateForStudent($studentId);
        $moyenne = $result['moyenne_generale'];

        User::where('id', $studentId)->update(['moyenne' => $moyenne]);

        return $moyenne;
    }
}
