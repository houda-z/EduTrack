<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commentaire extends Model
{
    protected $fillable = [
        'cours_id',
        'user_id',
        'contenu',
    ];

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
