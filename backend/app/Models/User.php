<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
            'name',
            'prenom',
            'email',
            'password',
            'filiere',
            'groupe',
            'filiere_id',
            'groupe_id',
            'telephone',
            'annee',
            'role',
            'bio',
            'photo',
            'moyenne',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function cours()
    {
        return $this->hasMany(Course::class, 'formateur_id');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class, 'formateur_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'etudiant_id');
    }

    public function reponses()
    {
        return $this->hasMany(ExamenReponse::class, 'etudiant_id');
    }

    public function sessions()
    {
        return $this->hasMany(SessionExamen::class, 'etudiant_id');
    }

    public function emploiDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class, 'formateur_id');
    }

    public function commentaires()
    {
        return $this->hasMany(Commentaire::class);
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'groupe_id');
    }

    public function groupes()
    {
        return $this->belongsToMany(Groupe::class, 'etudiant_groupe', 'etudiant_id', 'groupe_id');
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_user', 'user_id', 'module_id');
    }
}
