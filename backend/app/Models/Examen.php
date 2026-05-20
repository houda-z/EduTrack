<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    protected $table = 'examens';
    protected $fillable = ['titre', 'type', 'statut', 'enseignant_id', 'groupe_id', 'duree', 'date_debut', 'date_fin'];

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
