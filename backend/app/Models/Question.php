<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';
    protected $fillable = ['examen_id', 'texte', 'points', 'type', 'ordre'];

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }
}
