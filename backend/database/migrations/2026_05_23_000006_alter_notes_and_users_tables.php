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
        // 1. Add moyenne to users table
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('moyenne', 4, 2)->default(0.00)->after('photo');
        });

        // 2. Adjust notes table
        Schema::table('notes', function (Blueprint $table) {
            // Drop foreign key and column for session_id if it exists
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');

            // Add etudiant_id, formateur_id, cours_id, examen_id
            $table->unsignedBigInteger('etudiant_id')->after('id');
            $table->unsignedBigInteger('formateur_id')->after('etudiant_id');
            $table->unsignedBigInteger('cours_id')->nullable()->after('formateur_id');
            $table->unsignedBigInteger('examen_id')->nullable()->after('cours_id');

            // Setup foreign key constraints
            $table->foreign('etudiant_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('formateur_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('cours_id')
                  ->references('id')
                  ->on('cours')
                  ->onDelete('cascade');

            $table->foreign('examen_id')
                  ->references('id')
                  ->on('examens')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['etudiant_id']);
            $table->dropForeign(['formateur_id']);
            $table->dropForeign(['cours_id']);
            $table->dropForeign(['examen_id']);

            $table->dropColumn(['etudiant_id', 'formateur_id', 'cours_id', 'examen_id']);

            $table->unsignedBigInteger('session_id')->nullable();
            $table->foreign('session_id')
                  ->references('id')
                  ->on('sessions_examen')
                  ->onDelete('cascade');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('moyenne');
        });
    }
};
