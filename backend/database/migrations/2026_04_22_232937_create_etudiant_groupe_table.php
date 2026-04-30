<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etudiant_groupe', function (Blueprint $table) {
            $table->unsignedBigInteger('etudiant_id');
            $table->unsignedBigInteger('groupe_id');

            $table->primary(['etudiant_id', 'groupe_id']);

            $table->foreign('etudiant_id')
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
        Schema::dropIfExists('etudiant_groupe');
    }
};