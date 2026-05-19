<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $table = 'filieres';
    public $timestamps = false;
    
    protected $fillable = ['nom', 'description'];
}