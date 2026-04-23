<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cours', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('titre', 255);
            $table->longText('contenu')->nullable();
            $table->string('fichier_url', 500)->nullable();
            $table->unsignedBigInteger('enseignant_id');
            $table->unsignedBigInteger('filiere_id');
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();

            $table->foreign('enseignant_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('filiere_id')
                  ->references('id')
                  ->on('filieres')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};