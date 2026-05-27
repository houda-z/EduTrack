<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partie extends Model
{
    protected $table = 'parties';
    protected $fillable = ['examen_id', 'titre', 'introduction', 'ordre'];

    public function images()
    {
        return $this->hasMany(PartyImage::class, 'partie_id')->orderBy('ordre');
    }

    public function tableau()
    {
        return $this->hasOne(PartyTableau::class, 'partie_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'partie_id')->orderBy('ordre');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }
}
