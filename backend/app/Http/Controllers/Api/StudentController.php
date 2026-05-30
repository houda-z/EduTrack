<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Examen;
use App\Models\Filiere;
use App\Models\Groupe;
use App\Models\Note;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function getDashboardStats()
    {
        $user = auth()->user();
        [$filiereId, $groupeId] = $this->resolveStudentScope($user);

        $coursesQuery = $this->coursesQueryForStudent($filiereId, $groupeId);
        $totalCourses = (clone $coursesQuery)->count();

        $notesQuery = Note::where('etudiant_id', $user->id)
            ->with(['cours:id,titre', 'examen:id,titre']);

        $notesCount = (clone $notesQuery)->count();
        $coursNotesIds = (clone $notesQuery)->whereNotNull('cours_id')->distinct()->pluck('cours_id');
        $completedCourses = $coursNotesIds->count();

        $moyenne = $user->moyenne;
        if ($moyenne === null) {
            $avg = Note::where('etudiant_id', $user->id)->avg('note');
            $moyenne = $avg !== null ? round((float) $avg, 2) : null;
        }

        $examsQuery = $this->examsQueryForStudent($filiereId, $groupeId)
            ->whereIn('statut', ['publie', 'actif']);

        $upcomingCount = (clone $examsQuery)
            ->where(function ($q) {
                $q->where('date_examen', '>=', now())
                    ->orWhere('date_debut', '>=', now())
                    ->orWhere(function ($q2) {
                        $q2->whereNull('date_examen')->whereNull('date_debut');
                    });
            })
            ->count();

        $urgentExams = (clone $examsQuery)
            ->orderByRaw('COALESCE(date_examen, date_debut, created_at) ASC')
            ->limit(5)
            ->get()
            ->map(fn (Examen $exam) => $this->formatExamForDashboard($exam));

        $recentCourses = (clone $coursesQuery)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'titre', 'created_at'])
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'created_at' => $c->created_at?->toIso8601String(),
            ]);

        $recentNotes = Note::where('etudiant_id', $user->id)
            ->with(['cours:id,titre', 'examen:id,titre'])
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get();

        $recentActivity = collect();

        foreach ($recentNotes as $note) {
            $target = $note->examen?->titre ?? $note->cours?->titre ?? 'Évaluation';
            $recentActivity->push([
                'id' => 'note-' . $note->id,
                'action' => 'Note publiée',
                'target' => $target,
                'time' => $note->updated_at?->toIso8601String(),
                'result' => number_format((float) $note->note, 2) . '/20',
                'type' => 'note',
            ]);
        }

        foreach ($recentCourses as $course) {
            $recentActivity->push([
                'id' => 'cours-' . $course['id'],
                'action' => 'Nouveau cours',
                'target' => $course['titre'],
                'time' => $course['created_at'],
                'result' => null,
                'type' => 'cours',
            ]);
        }

        $recentActivity = $recentActivity
            ->sortByDesc('time')
            ->take(6)
            ->values();

        $completionPercent = $totalCourses > 0
            ? (int) round(($completedCourses / $totalCourses) * 100)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'prenom' => $user->prenom,
                    'email' => $user->email,
                    'moyenne' => $moyenne,
                    'filiere' => $user->filiere,
                    'groupe' => $user->groupe,
                    'last_connection' => $user->updated_at?->toIso8601String(),
                ],
                'stats' => [
                    'moyenne' => $moyenne,
                    'cours_termines' => $completedCourses,
                    'cours_total' => $totalCourses,
                    'cours_completion_percent' => $completionPercent,
                    'examens_a_venir' => $upcomingCount,
                    'notes_count' => $notesCount,
                    'points_activite' => ($notesCount * 120) + ($completedCourses * 80),
                ],
                'urgent_exams' => $urgentExams,
                'recent_activity' => $recentActivity,
                'recent_courses' => $recentCourses,
            ],
            'message' => 'Tableau de bord récupéré avec succès.',
        ]);
    }

    public function getCourses()
    {
        $user = auth()->user();
        [$filiereId, $groupeId] = $this->resolveStudentScope($user);

        $courses = $this->coursesQueryForStudent($filiereId, $groupeId)
            ->with(['formateur:id,name,prenom', 'filiere:id,nom', 'groupe:id,nom'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    public function getExams()
    {
        $user = auth()->user();
        [$filiereId, $groupeId] = $this->resolveStudentScope($user);

        $exams = $this->examsQueryForStudent($filiereId, $groupeId)
            ->with(['formateur:id,name,prenom', 'filiere:id,nom', 'groupe:id,nom'])
            ->orderByDesc('date_examen')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $exams,
        ]);
    }

    public function getGrades()
    {
        $user = auth()->user();

        $grades = Note::with(['cours:id,titre', 'examen:id,titre', 'formateur:id,name,prenom'])
            ->where('etudiant_id', $user->id)
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $grades,
        ]);
    }

    public function getProfile()
    {
        return response()->json([
            'success' => true,
            'data' => Auth::user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $user->update($request->only(['telephone', 'email', 'bio']));

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès.',
            'data' => $user->fresh(),
        ]);
    }

    public function submitExam(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Examen soumis avec succès.',
        ]);
    }

    private function resolveStudentScope(User $user): array
    {
        $filiereId = $user->filiere_id;
        $groupeId = $user->groupe_id;

        if (! $filiereId && $user->filiere) {
            $filiere = Filiere::where('nom', $user->filiere)->first();
            $filiereId = $filiere?->id;
        }
        if (! $groupeId && $user->groupe) {
            $groupe = Groupe::where('nom', $user->groupe)->first();
            $groupeId = $groupe?->id;
        }

        return [$filiereId, $groupeId];
    }

    private function coursesQueryForStudent(?int $filiereId, ?int $groupeId)
    {
        $query = Course::query();

        if ($filiereId) {
            $query->where('filiere_id', $filiereId);
        }
        if ($groupeId) {
            $query->where(function ($q) use ($groupeId) {
                $q->where('groupe_id', $groupeId)->orWhereNull('groupe_id');
            });
        }

        return $query;
    }

    private function examsQueryForStudent(?int $filiereId, ?int $groupeId)
    {
        $query = Examen::query();

        if ($filiereId) {
            $query->where('filiere_id', $filiereId);
        }
        if ($groupeId) {
            $query->where('groupe_id', $groupeId);
        }

        return $query;
    }

    private function formatExamForDashboard(Examen $exam): array
    {
        $date = $exam->date_examen ?? $exam->date_debut;
        $carbon = $date ? Carbon::parse($date) : null;
        $isCritical = $carbon && $carbon->isBetween(now(), now()->addDay());

        $duration = $exam->duree_minutes
            ? $exam->duree_minutes . ' min'
            : ($exam->duree ? $exam->duree . ' min' : '—');

        return [
            'id' => $exam->id,
            'title' => $exam->titre,
            'date' => $carbon ? $carbon->toIso8601String() : null,
            'date_label' => $this->formatExamDateLabel($carbon),
            'duration' => $duration,
            'status' => $isCritical ? 'Critical' : 'Upcoming',
            'statut' => $exam->statut,
        ];
    }

    private function formatExamDateLabel(?Carbon $date): string
    {
        if (! $date) {
            return 'Date à confirmer';
        }

        if ($date->isToday()) {
            return "Aujourd'hui, " . $date->format('H:i');
        }
        if ($date->isTomorrow()) {
            return 'Demain, ' . $date->format('H:i');
        }

        $months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

        return $date->format('j') . ' ' . $months[$date->month - 1] . ', ' . $date->format('H:i');
    }
}
