<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->string('titre');
            $table->longText('introduction')->nullable();
            $table->integer('ordre')->default(1);
            $table->timestamps();
        });

        Schema::create('party_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partie_id')->constrained('parties')->onDelete('cascade');
            $table->longText('image'); // base64
            $table->integer('ordre')->default(1);
            $table->timestamps();
        });

        Schema::create('party_tableaux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partie_id')->constrained('parties')->onDelete('cascade');
            $table->json('headers'); // ["Méthode", "Route", "Auth"]
            $table->json('rows'); // [["POST", "/login", "Non"], ["GET", "/users", "Oui"]]
            $table->timestamps();
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('partie_id')->nullable()->constrained('parties')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['partie_id']);
            $table->dropColumn('partie_id');
        });

        Schema::dropIfExists('party_tableaux');
        Schema::dropIfExists('party_images');
        Schema::dropIfExists('parties');
    }
};
