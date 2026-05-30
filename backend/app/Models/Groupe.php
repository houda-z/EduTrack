<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    protected $table = 'groupes';
    protected $fillable = ['nom', 'filiere_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function etudiants()
    {
        return $this->belongsToMany(User::class, 'etudiant_groupe', 'groupe_id', 'etudiant_id');
    }

    public $timestamps = false;
}
