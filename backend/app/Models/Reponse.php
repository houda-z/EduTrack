<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reponse extends Model
{
    protected $table = 'reponses';
    public $timestamps = false;

    protected $fillable = ['session_id', 'question_id', 'contenu', 'choix_id', 'saved_at'];

    protected $casts = [
        'saved_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(SessionExamen::class, 'session_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function choix()
    {
        return $this->belongsTo(ChoixQcm::class, 'choix_id');
    }
}
