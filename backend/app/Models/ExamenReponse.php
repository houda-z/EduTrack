<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamenReponse extends Model
{
    protected $table = 'examen_reponses';
    protected $fillable = ['etudiant_id', 'examen_id', 'question_id', 'reponse_texte', 'choix_qcm_id', 'note_attribuee'];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'examen_id');
    }

    public function choix()
    {
        return $this->belongsTo(ChoixQcm::class, 'choix_qcm_id');
    }
}
