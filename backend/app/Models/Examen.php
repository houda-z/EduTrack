<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    protected $table = 'examens';
    protected $fillable = ['titre', 'introduction', 'type', 'statut', 'formateur_id', 'enseignant_id', 'filiere_id', 'groupe_id', 'module_id', 'duree', 'date_debut', 'date_fin', 'duree_minutes', 'date_examen'];

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function parties()
    {
        return $this->hasMany(Partie::class)->orderBy('ordre');
    }

    public function sessions()
    {
        return $this->hasMany(SessionExamen::class, 'examen_id');
    }

    public function reponses()
    {
        return $this->hasMany(ExamenReponse::class, 'examen_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'examen_id');
    }
}
