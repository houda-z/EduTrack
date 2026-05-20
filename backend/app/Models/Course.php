<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $table = 'cours';
    protected $fillable = ['titre', 'contenu', 'fichier_url', 'enseignant_id', 'filiere_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }
}
