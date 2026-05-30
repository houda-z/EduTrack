<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    protected $table = 'emploi_du_temps';

    protected $fillable = [
        'formateur_id',
        'groupe_id',
        'titre',
        'jour',
        'heure_debut',
        'heure_fin',
        'salle',
        'type',
    ];

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }
}
