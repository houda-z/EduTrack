<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reponses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('question_id');
            $table->longText('contenu')->nullable();
            $table->unsignedBigInteger('choix_id')->nullable();
            $table->dateTime('saved_at')->useCurrent();

            $table->unique(['session_id', 'question_id']);

            $table->foreign('session_id')
                  ->references('id')
                  ->on('sessions_examen')
                  ->onDelete('cascade');

            $table->foreign('question_id')
                  ->references('id')
                  ->on('questions')
                  ->onDelete('cascade');

            $table->foreign('choix_id')
                  ->references('id')
                  ->on('choix_qcm')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reponses');
    }
};