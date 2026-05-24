<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cours_fichiers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cours_id');
            $table->string('nom', 255);
            $table->string('chemin', 500);
            $table->enum('type', ['pdf', 'video', 'lien', 'image']);
            $table->string('url', 500)->nullable();
            $table->timestamps();

            $table->foreign('cours_id')
                  ->references('id')
                  ->on('cours')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cours_fichiers');
    }
};
