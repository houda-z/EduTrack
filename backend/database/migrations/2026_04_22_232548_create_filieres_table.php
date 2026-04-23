<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filieres', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->dateTime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filieres');
    }
};