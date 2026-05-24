<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChoixQcm extends Model
{
    protected $table = 'choix_qcm';
    public $timestamps = false;

    protected $fillable = ['question_id', 'texte', 'est_correct'];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
