<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('examen_id');
            $table->text('enonce');
            $table->enum('type', ['qcm', 'code', 'texte'])->default('texte');
            $table->float('points')->default(1);
            $table->unsignedInteger('ordre')->default(1);
            $table->longText('image_base64')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('examen_id')
                  ->references('id')
                  ->on('examens')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};