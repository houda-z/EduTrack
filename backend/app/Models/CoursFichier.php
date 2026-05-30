<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class CoursFichier extends Model
{
    protected $table = 'cours_fichiers';

    protected $fillable = [
        'cours_id',
        'nom',
        'chemin',
        'type',
        'url',
    ];

    protected $appends = ['view_url', 'download_url'];

    public function cours()
    {
        return $this->belongsTo(Course::class, 'cours_id');
    }

    /**
     * URL absolue pour afficher le fichier dans le navigateur (PDF inline via servePdf).
     */
    protected function viewUrl(): Attribute
    {
        return Attribute::get(function () {
            if ($this->url && filter_var($this->url, FILTER_VALIDATE_URL)) {
                return $this->url;
            }

            if ($this->chemin && filter_var($this->chemin, FILTER_VALIDATE_URL)) {
                return $this->chemin;
            }

            $filename = $this->resolveFilename();
            if ($this->cours_id && $filename) {
                return url('/storage/cours/' . $this->cours_id . '/' . rawurlencode($filename));
            }

            if ($this->chemin && ! str_starts_with($this->chemin, 'http')) {
                $relative = str_replace('public/', '', $this->chemin);

                return Storage::disk('public')->url($relative);
            }

            return $this->url;
        });
    }

    /**
     * URL absolue pour forcer le téléchargement (Content-Disposition: attachment).
     */
    protected function downloadUrl(): Attribute
    {
        return Attribute::get(function () {
            if ($this->chemin && filter_var($this->chemin, FILTER_VALIDATE_URL)) {
                return $this->chemin;
            }

            if ($this->url && filter_var($this->url, FILTER_VALIDATE_URL) && ! $this->isStoredFile()) {
                return $this->url;
            }

            $filename = $this->resolveFilename();
            if ($this->cours_id && $filename) {
                return url('/storage/cours/' . $this->cours_id . '/' . rawurlencode($filename) . '?download=1');
            }

            $view = $this->view_url;
            if ($view && $this->isStoredFile()) {
                return str_contains($view, '?') ? $view . '&download=1' : $view . '?download=1';
            }

            return $view;
        });
    }

    public function isStoredFile(): bool
    {
        return $this->chemin && ! filter_var($this->chemin, FILTER_VALIDATE_URL);
    }

    public function resolveFilename(): ?string
    {
        if ($this->nom) {
            return $this->nom;
        }

        if ($this->chemin) {
            return basename(str_replace('\\', '/', $this->chemin));
        }

        return null;
    }
}
