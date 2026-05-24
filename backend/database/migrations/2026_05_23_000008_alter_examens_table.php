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
        Schema::table('examens', function (Blueprint $table) {
            if (!Schema::hasColumn('examens', 'formateur_id')) {
                $table->unsignedBigInteger('formateur_id')->nullable()->after('enseignant_id');
                $table->foreign('formateur_id')
                      ->references('id')
                      ->on('users')
                      ->onDelete('cascade');
            }
            if (!Schema::hasColumn('examens', 'filiere_id')) {
                $table->unsignedBigInteger('filiere_id')->nullable()->after('formateur_id');
                $table->foreign('filiere_id')
                      ->references('id')
                      ->on('filieres')
                      ->onDelete('cascade');
            }
            if (!Schema::hasColumn('examens', 'date_examen')) {
                $table->dateTime('date_examen')->nullable()->after('date_fin');
            }
            if (!Schema::hasColumn('examens', 'duree_minutes')) {
                $table->unsignedInteger('duree_minutes')->nullable()->after('duree');
            }
            
            // To handle database enum constraints flexibly, we make type and statut generic string columns
            $table->string('type')->change()->default('qcm');
            $table->string('statut')->change()->default('brouillon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('examens', function (Blueprint $table) {
            $table->dropForeign(['formateur_id']);
            $table->dropForeign(['filiere_id']);
            $table->dropColumn(['formateur_id', 'filiere_id', 'date_examen', 'duree_minutes']);
        });
    }
};
