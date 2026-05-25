<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';
    protected $fillable = ['examen_id', 'enonce', 'texte', 'points', 'type', 'ordre', 'image_base64'];

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function choix()
    {
        return $this->hasMany(ChoixQcm::class, 'question_id');
    }
    public $timestamps = false;
}
