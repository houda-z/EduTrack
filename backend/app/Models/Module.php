<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'nom',
        'code',
        'filiere_id',
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    public function formateurs()
    {
        return $this->belongsToMany(User::class, 'module_user', 'module_id', 'user_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'module_id');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class, 'module_id');
    }
}
