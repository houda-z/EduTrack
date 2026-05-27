<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';
    protected $fillable = ['examen_id', 'partie_id', 'enonce', 'type', 'points', 'ordre', 'file'];
    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function partie()
    {
        return $this->belongsTo(Partie::class);
    }

    public function choix()
    {
        return $this->hasMany(ChoixQcm::class, 'question_id');
    }

    public function reponses()
    {
        return $this->hasMany(ExamenReponse::class, 'question_id');
    }

    public $timestamps = false;
}
