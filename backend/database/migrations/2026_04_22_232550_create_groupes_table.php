<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groupes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nom', 100);
            $table->unsignedBigInteger('filiere_id');
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('filiere_id')
                  ->references('id')
                  ->on('filieres')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groupes');
    }
};