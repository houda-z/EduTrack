<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emploi_du_temps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('formateur_id');
            $table->unsignedBigInteger('groupe_id');
            $table->string('titre', 255);
            $table->enum('jour', ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']);
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('salle', 100)->nullable();
            $table->enum('type', ['cours', 'exam', 'tp']);
            $table->timestamps();

            $table->foreign('formateur_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('groupe_id')
                  ->references('id')
                  ->on('groupes')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};
