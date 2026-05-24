<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoursFichier extends Model
{
    protected $table = 'cours_fichiers';

    protected $fillable = [
        'cours_id',
        'nom',
        'chemin',
        'type',
        'url',
    ];

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }
}
