<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyTableau extends Model
{
    protected $table = 'party_tableaux';
    protected $fillable = ['partie_id', 'headers', 'rows'];

    protected $casts = [
        'headers' => 'array',
        'rows' => 'array'
    ];

    public function partie()
    {
        return $this->belongsTo(Partie::class);
    }
}
