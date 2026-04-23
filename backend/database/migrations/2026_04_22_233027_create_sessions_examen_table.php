<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions_examen', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('etudiant_id');
            $table->unsignedBigInteger('examen_id');
            $table->enum('statut', ['en_cours', 'soumis', 'bloque'])->default('en_cours');
            $table->dateTime('debut_at')->useCurrent();
            $table->dateTime('fin_at')->nullable();
            $table->unsignedInteger('nb_sorties')->default(0);

            $table->unique(['etudiant_id', 'examen_id']);

            $table->foreign('etudiant_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('examen_id')
                  ->references('id')
                  ->on('examens')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions_examen');
    }
};