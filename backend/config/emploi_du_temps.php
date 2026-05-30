<?php

return [
    /*
    | Plage horaire continue pour la planification des cours.
    | Remplace l'ancienne configuration en deux blocs (08:00-12:00 / 14:00-18:00).
    */
    'horaire_debut' => '08:30',
    'horaire_fin' => '18:30',

    'jours' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],

    'types' => ['cours', 'exam', 'tp'],

    /** Intervalle (minutes) pour les créneaux suggérés dans l'interface */
    'intervalle_creneaux' => 60,
];
