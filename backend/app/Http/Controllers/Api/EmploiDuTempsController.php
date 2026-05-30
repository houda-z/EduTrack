<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use App\Services\EmploiDuTempsService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmploiDuTempsController extends Controller
{
    public function __construct(
        private readonly EmploiDuTempsService $scheduleService
    ) {}

    public function config()
    {
        $config = $this->scheduleService->config();

        return response()->json([
            'success' => true,
            'data' => [
                'horaire_debut' => $config['horaire_debut'],
                'horaire_fin' => $config['horaire_fin'],
                'jours' => $config['jours'],
                'types' => $config['types'],
                'intervalle_creneaux' => $config['intervalle_creneaux'],
                'creneaux_suggerees' => $this->scheduleService->suggestedSlots(),
            ],
            'message' => 'Configuration horaire récupérée.',
        ]);
    }

    public function index(Request $request)
    {
        $groupeId = $request->query('groupe_id');

        $query = EmploiDuTemps::with(['formateur', 'groupe']);

        if ($groupeId) {
            $query->where('groupe_id', $groupeId);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('jour')->orderBy('heure_debut')->get(),
            'message' => 'Emploi du temps récupéré avec succès.',
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'enseignant' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $this->validateSession($request);

        $this->scheduleService->validateSessionTimes(
            $validated['heure_debut'],
            $validated['heure_fin']
        );

        $this->scheduleService->assertNoOverlap(
            (int) $validated['groupe_id'],
            $validated['jour'],
            $validated['heure_debut'],
            $validated['heure_fin']
        );

        $session = EmploiDuTemps::create([
            'formateur_id' => $user->id,
            'groupe_id' => $validated['groupe_id'],
            'titre' => $validated['titre'],
            'jour' => strtolower($validated['jour']),
            'heure_debut' => $this->scheduleService->normalizeTime($validated['heure_debut']),
            'heure_fin' => $this->scheduleService->normalizeTime($validated['heure_fin']),
            'salle' => $validated['salle'] ?? '',
            'type' => $validated['type'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $session,
            'message' => 'Session ajoutée avec succès.',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $session = EmploiDuTemps::findOrFail($id);

        if ($session->formateur_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $this->validateSession($request);

        $this->scheduleService->validateSessionTimes(
            $validated['heure_debut'],
            $validated['heure_fin']
        );

        $this->scheduleService->assertNoOverlap(
            (int) $validated['groupe_id'],
            $validated['jour'],
            $validated['heure_debut'],
            $validated['heure_fin'],
            (int) $session->id
        );

        $session->update([
            'groupe_id' => $validated['groupe_id'],
            'titre' => $validated['titre'],
            'jour' => strtolower($validated['jour']),
            'heure_debut' => $this->scheduleService->normalizeTime($validated['heure_debut']),
            'heure_fin' => $this->scheduleService->normalizeTime($validated['heure_fin']),
            'salle' => $validated['salle'] ?? '',
            'type' => $validated['type'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $session->fresh(),
            'message' => 'Session modifiée avec succès.',
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $session = EmploiDuTemps::findOrFail($id);

        if ($session->formateur_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $session->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Session supprimée avec succès.',
        ]);
    }

    private function validateSession(Request $request): array
    {
        $jours = config('emploi_du_temps.jours');
        $types = config('emploi_du_temps.types');

        return $request->validate([
            'groupe_id' => 'required|exists:groupes,id',
            'titre' => 'required|string|max:255',
            'jour' => ['required', Rule::in($jours)],
            'heure_debut' => ['required', 'date_format:H:i'],
            'heure_fin' => ['required', 'date_format:H:i', 'after:heure_debut'],
            'salle' => 'nullable|string|max:100',
            'type' => ['required', Rule::in($types)],
        ]);
    }
}
