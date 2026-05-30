<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartyImage extends Model
{
    protected $table = 'party_images';
    protected $fillable = ['partie_id', 'image', 'ordre'];

    public function partie()
    {
        return $this->belongsTo(Partie::class);
    }
}
