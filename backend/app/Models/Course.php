<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'cours';
    protected $fillable = ['titre', 'contenu', 'description', 'fichier_url', 'formateur_id', 'enseignant_id', 'filiere_id', 'groupe_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    public function fichiers()
    {
        return $this->hasMany(CoursFichier::class, 'cours_id');
    }

    public function commentaires()
    {
        return $this->hasMany(Commentaire::class, 'cours_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'cours_id');
    }
}
