<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $fillable = ['nom', 'description'];
    public $timestamps = false; // The migration has created_at but not updated_at
}
