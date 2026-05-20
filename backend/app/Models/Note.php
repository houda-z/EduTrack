<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $table = 'notes';
    protected $fillable = ['etudiant_id', 'examen_id', 'valeur', 'commentaire'];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }
}
