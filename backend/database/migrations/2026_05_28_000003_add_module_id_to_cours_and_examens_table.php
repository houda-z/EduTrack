<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            if (!Schema::hasColumn('cours', 'module_id')) {
                $table->foreignId('module_id')->nullable()->after('groupe_id')
                      ->constrained('modules')
                      ->onDelete('set null');
            }
        });

        Schema::table('examens', function (Blueprint $table) {
            if (!Schema::hasColumn('examens', 'module_id')) {
                $table->foreignId('module_id')->nullable()->after('filiere_id')
                      ->constrained('modules')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            if (Schema::hasColumn('cours', 'module_id')) {
                $table->dropForeign(['module_id']);
                $table->dropColumn('module_id');
            }
        });

        Schema::table('examens', function (Blueprint $table) {
            if (Schema::hasColumn('examens', 'module_id')) {
                $table->dropForeign(['module_id']);
                $table->dropColumn('module_id');
            }
        });
    }
};
