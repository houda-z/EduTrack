<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Filiere;
use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Fetch general system statistics.
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $totalEtudiants = User::where('role', 'etudiant')->count();
        $totalEnseignants = User::where('role', 'enseignant')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalFilieres = Filiere::count();
        $totalGroupes = Groupe::count();

        return response()->json([
            'total_users' => $totalUsers,
            'total_etudiants' => $totalEtudiants,
            'total_enseignants' => $totalEnseignants,
            'total_admins' => $totalAdmins,
            'total_filieres' => $totalFilieres,
            'total_groupes' => $totalGroupes,
        ]);
    }

    // GET all users
    public function getUsers() {
        $users = User::with(['filiere', 'groupe'])->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    // CREATE single user
    public function createUser(Request $request) {
        $request->validate([
            'prenom' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:etudiant,enseignant,admin',
            'telephone' => 'nullable|string',
            'annee' => 'nullable|string',
            'filiere_id' => 'required_if:role,etudiant|nullable|exists:filieres,id',
            'groupe_id' => 'required_if:role,etudiant|nullable|exists:groupes,id',
        ]);

        $password = Str::random(8);

        $user = User::create([
            'prenom' => $request->prenom,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'role' => $request->role,
            'telephone' => $request->telephone,
            'annee' => $request->annee,
            // Save relations properly using IDs
            'filiere_id' => $request->role === 'etudiant' ? $request->filiere_id : null,
            'groupe_id' => $request->role === 'etudiant' ? $request->groupe_id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Utilisateur créé avec succès.",
            'credentials' => [
                'nom' => "{$user->prenom} {$user->name}",
                'email' => $user->email,
                'password' => $password,
                'role' => $user->role
            ]
        ]);
    }

    // UPDATE user role
    public function updateUserRole(Request $request, $id) {
        $request->validate(['role' => 'required|in:etudiant,enseignant,admin']);
        User::findOrFail($id)->update(['role' => $request->role]);
        return response()->json(['success' => true, 'message' => 'Rôle mis à jour.']);
    }

    // DELETE user
    public function deleteUser($id) {
        User::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Utilisateur supprimé.']);
    }

    // GET all modules
    public function getModules() {
        $modules = \App\Models\Module::with('filiere:id,nom')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $modules]);
    }

    // CREATE module
    public function createModule(Request $request) {
        $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:modules,code',
            'filiere_id' => 'required|exists:filieres,id',
        ]);
        $module = \App\Models\Module::create([
            'nom' => $request->nom,
            'code' => $request->code,
            'filiere_id' => $request->filiere_id,
        ]);
        return response()->json(['success' => true, 'data' => $module->load('filiere:id,nom')]);
    }

    // DELETE module
    public function deleteModule($id) {
        \App\Models\Module::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }


    // System Backups (Maroua Features) - Existing empty stub for context
    public function getBackups() {
        return response()->json([]);
    }

    public function generateBackup() {
        return response()->json(['message' => 'Backup generated']);
    }

    // IMPORT filieres from Excel
    public function importFilieres(Request $request) {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);

        $rows = Excel::toArray([], $request->file('file'))[0];
        $created = 0;
        $errors = [];

        foreach (array_slice($rows, 1) as $index => $row) {
            // Expected columns: nom, description
            $nom = trim($row[0] ?? '');
            $description = trim($row[1] ?? '');

            if (empty($nom)) {
                $errors[] = "Ligne " . ($index + 2) . ": nom manquant.";
                continue;
            }

            Filiere::firstOrCreate(['nom' => $nom], ['description' => $description]);
            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "$created filière(s) importée(s).",
            'errors' => $errors,
        ]);
    }

    // IMPORT groupes from Excel
    public function importGroupes(Request $request) {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls,csv']);

        $rows = Excel::toArray([], $request->file('file'))[0];
        $created = 0;
        $errors = [];

        foreach (array_slice($rows, 1) as $index => $row) {
            // Expected columns: nom, filiere_nom
            $nom = trim($row[0] ?? '');
            $filiereNom = trim($row[1] ?? '');

            if (empty($nom) || empty($filiereNom)) {
                $errors[] = "Ligne " . ($index + 2) . ": données incomplètes.";
                continue;
            }

            $filiere = Filiere::where('nom', $filiereNom)->first();
            if (!$filiere) {
                $errors[] = "Ligne " . ($index + 2) . ": filière '$filiereNom' introuvable.";
                continue;
            }

            Groupe::firstOrCreate(['nom' => $nom, 'filiere_id' => $filiere->id]);
            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "$created groupe(s) importé(s).",
            'errors' => $errors,
        ]);
    }

    // IMPORT users from Excel
    public function importUsers(Request $request) {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'role' => 'required|in:etudiant,enseignant'
        ]);

        $role = $request->input('role');
        $rows = Excel::toArray([], $request->file('file'))[0];
        $created = 0;
        $errors = [];
        $credentials = [];

        foreach (array_slice($rows, 1) as $index => $row) {
            $prenom = trim($row[0] ?? '');
            $name = trim($row[1] ?? '');
            $email = trim($row[2] ?? '');
            $filiereNom = trim($row[3] ?? '');
            $groupeNom = trim($row[4] ?? '');
            $telephone = trim($row[5] ?? '');
            $telephone = $telephone === '' ? null : $telephone;
            $annee = trim($row[6] ?? '');
            $annee = $annee === '' ? null : $annee;

            if (empty($prenom) || empty($name) || empty($email)) {
                $errors[] = "Ligne " . ($index + 2) . ": données obligatoires manquantes.";
                continue;
            }

            if (User::where('email', $email)->exists()) {
                $errors[] = "Ligne " . ($index + 2) . ": email '$email' déjà utilisé.";
                continue;
            }

            $filiere = $filiereNom ? Filiere::where('nom', $filiereNom)->first() : null;
            $groupe = $groupeNom && $filiere ? Groupe::where('nom', $groupeNom)->where('filiere_id', $filiere->id)->first() : null;

            // Auto-generate password
            $password = Str::random(8);

            User::create([
                'prenom' => $prenom,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role,
                'filiere_id' => $filiere?->id,
                'groupe_id' => $groupe?->id,
                'telephone' => $telephone,
                'annee' => $annee,
            ]);

            $credentials[] = [
                'nom' => "$prenom $name",
                'email' => $email,
                'password' => $password,
                'role' => $role,
            ];
            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "$created utilisateur(s) importé(s) comme $role.",
            'credentials' => $credentials, // Show generated passwords to admin
            'errors' => $errors,
        ]);
    }
}
