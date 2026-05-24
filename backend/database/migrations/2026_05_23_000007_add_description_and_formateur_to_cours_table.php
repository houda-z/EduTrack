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
        Schema::table('cours', function (Blueprint $table) {
            if (!Schema::hasColumn('cours', 'description')) {
                $table->text('description')->nullable()->after('titre');
            }
            if (!Schema::hasColumn('cours', 'formateur_id')) {
                $table->unsignedBigInteger('formateur_id')->nullable()->after('enseignant_id');
                $table->foreign('formateur_id')
                      ->references('id')
                      ->on('users')
                      ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            $table->dropForeign(['formateur_id']);
            $table->dropColumn(['description', 'formateur_id']);
        });
    }
};
