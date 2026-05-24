<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionExamen extends Model
{
    protected $table = 'sessions_examen';
    public $timestamps = false;

    protected $fillable = ['etudiant_id', 'examen_id', 'statut', 'debut_at', 'fin_at', 'nb_sorties'];

    protected $casts = [
        'debut_at' => 'datetime',
        'fin_at' => 'datetime',
    ];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'examen_id');
    }

    public function reponses()
    {
        return $this->hasMany(Reponse::class, 'session_id');
    }
}
