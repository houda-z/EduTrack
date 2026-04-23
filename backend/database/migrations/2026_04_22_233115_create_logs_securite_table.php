<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs_securite', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('session_id');
            $table->string('type_evenement', 100);
            $table->text('detail')->nullable();
            $table->unsignedBigInteger('autorise_par')->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('session_id')
                  ->references('id')
                  ->on('sessions_examen')
                  ->onDelete('cascade');

            $table->foreign('autorise_par')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_securite');
    }
};