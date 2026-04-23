<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('titre', 255);
            $table->enum('type', ['examen', 'controle'])->default('controle');
            $table->enum('statut', ['brouillon', 'actif', 'cloture'])->default('brouillon');
            $table->unsignedBigInteger('enseignant_id');
            $table->unsignedBigInteger('groupe_id');
            $table->unsignedInteger('duree');
            $table->dateTime('date_debut')->nullable();
            $table->dateTime('date_fin')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();

            $table->foreign('enseignant_id')
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
        Schema::dropIfExists('examens');
    }
};