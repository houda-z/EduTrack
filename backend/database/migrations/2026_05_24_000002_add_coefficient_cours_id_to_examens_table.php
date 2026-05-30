<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add coefficient column to examens table.
     * Each examen has a weight used in the weighted moyenne calculation per cours/module.
     * Also adds cours_id to link an examen to a specific module (cours).
     */
    public function up(): void
    {
        Schema::table('examens', function (Blueprint $table) {
            if (!Schema::hasColumn('examens', 'coefficient')) {
                $table->unsignedTinyInteger('coefficient')->default(1)->after('statut');
            }
            if (!Schema::hasColumn('examens', 'cours_id')) {
                $table->unsignedBigInteger('cours_id')->nullable()->after('coefficient');
                $table->foreign('cours_id')
                      ->references('id')
                      ->on('cours')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('examens', function (Blueprint $table) {
            if (Schema::hasColumn('examens', 'cours_id')) {
                $table->dropForeign(['cours_id']);
                $table->dropColumn('cours_id');
            }
            if (Schema::hasColumn('examens', 'coefficient')) {
                $table->dropColumn('coefficient');
            }
        });
    }
};
