<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $table = 'notes';
    protected $fillable = ['etudiant_id', 'formateur_id', 'cours_id', 'examen_id', 'note', 'commentaire'];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function cours()
    {
        return $this->belongsTo(Course::class, 'cours_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'examen_id');
    }
}
