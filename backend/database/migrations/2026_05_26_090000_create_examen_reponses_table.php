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
        Schema::create('examen_reponses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('examen_id')->constrained('examens')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->longText('reponse_texte')->nullable(); // For code, texte, and commande types
            $table->foreignId('choix_qcm_id')->nullable()->constrained('choix_qcm')->onDelete('set null'); // For QCM type
            $table->decimal('note_attribuee', 5, 2)->nullable(); // Graded by Formateur later
            $table->timestamps();
        });

        Schema::table('sessions_examen', function (Blueprint $table) {
            if (!Schema::hasColumn('sessions_examen', 'note_totale')) {
                $table->decimal('note_totale', 5, 2)->nullable()->after('statut');
            }
            $table->string('statut')->default('en_cours')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sessions_examen', function (Blueprint $table) {
            $table->dropColumn('note_totale');
            // Revert back to enum if necessary, or keep as string
        });

        Schema::dropIfExists('examen_reponses');
    }
};
