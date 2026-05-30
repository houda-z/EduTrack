<?php

namespace App\Services;

use App\Models\EmploiDuTemps;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class EmploiDuTempsService
{
    public function config(): array
    {
        return config('emploi_du_temps');
    }

    public function horaireDebutMinutes(): int
    {
        return $this->timeToMinutes(config('emploi_du_temps.horaire_debut'));
    }

    public function horaireFinMinutes(): int
    {
        return $this->timeToMinutes(config('emploi_du_temps.horaire_fin'));
    }

    public function timeToMinutes(string $time): int
    {
        $normalized = strlen($time) === 5 ? $time . ':00' : $time;
        $parsed = Carbon::createFromFormat('H:i:s', $normalized);

        return $parsed->hour * 60 + $parsed->minute;
    }

    public function minutesToTime(int $minutes): string
    {
        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        return sprintf('%02d:%02d', $hours, $mins);
    }

    /**
     * @return array{debut: string, fin: string, label: string}[]
     */
    public function suggestedSlots(?int $intervalMinutes = null): array
    {
        $interval = $intervalMinutes ?? (int) config('emploi_du_temps.intervalle_creneaux', 60);
        $start = $this->horaireDebutMinutes();
        $end = $this->horaireFinMinutes();
        $slots = [];

        for ($cursor = $start; $cursor + $interval <= $end; $cursor += $interval) {
            $debut = $this->minutesToTime($cursor);
            $fin = $this->minutesToTime($cursor + $interval);
            $slots[] = [
                'debut' => $debut,
                'fin' => $fin,
                'label' => "{$debut}-{$fin}",
            ];
        }

        return $slots;
    }

    public function validateSessionTimes(string $heureDebut, string $heureFin): void
    {
        $debut = $this->timeToMinutes($this->normalizeTime($heureDebut));
        $fin = $this->timeToMinutes($this->normalizeTime($heureFin));
        $min = $this->horaireDebutMinutes();
        $max = $this->horaireFinMinutes();

        if ($debut < $min) {
            throw ValidationException::withMessages([
                'heure_debut' => ['L\'heure de début doit être au minimum ' . config('emploi_du_temps.horaire_debut') . '.'],
            ]);
        }

        if ($fin > $max) {
            throw ValidationException::withMessages([
                'heure_fin' => ['L\'heure de fin doit être au maximum ' . config('emploi_du_temps.horaire_fin') . '.'],
            ]);
        }

        if ($fin <= $debut) {
            throw ValidationException::withMessages([
                'heure_fin' => ['L\'heure de fin doit être postérieure à l\'heure de début.'],
            ]);
        }
    }

    public function assertNoOverlap(
        int $groupeId,
        string $jour,
        string $heureDebut,
        string $heureFin,
        ?int $excludeId = null
    ): void {
        $debut = $this->timeToMinutes($this->normalizeTime($heureDebut));
        $fin = $this->timeToMinutes($this->normalizeTime($heureFin));

        $query = EmploiDuTemps::where('groupe_id', $groupeId)
            ->where('jour', strtolower($jour));

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $conflict = $query->get()->first(function (EmploiDuTemps $session) use ($debut, $fin) {
            $sessDebut = $this->timeToMinutes($this->normalizeTime($session->heure_debut));
            $sessFin = $this->timeToMinutes($this->normalizeTime($session->heure_fin));

            return $debut < $sessFin && $fin > $sessDebut;
        });

        if ($conflict) {
            throw ValidationException::withMessages([
                'heure_debut' => ['Ce créneau chevauche une session existante (« ' . $conflict->titre . ' »).'],
            ]);
        }
    }

    public function normalizeTime(string $time): string
    {
        $time = substr(trim($time), 0, 5);

        return strlen($time) === 5 ? $time . ':00' : $time;
    }
}
