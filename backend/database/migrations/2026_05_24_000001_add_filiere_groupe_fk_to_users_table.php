<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add filiere_id and groupe_id foreign key columns to users table.
     * These are the integer FK equivalents of the legacy string columns
     * 'filiere' and 'groupe', kept in parallel for backward compatibility.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'filiere_id')) {
                $table->unsignedBigInteger('filiere_id')->nullable()->after('groupe');
                $table->foreign('filiere_id')
                      ->references('id')
                      ->on('filieres')
                      ->onDelete('set null');
            }
            if (!Schema::hasColumn('users', 'groupe_id')) {
                $table->unsignedBigInteger('groupe_id')->nullable()->after('filiere_id');
                $table->foreign('groupe_id')
                      ->references('id')
                      ->on('groupes')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['filiere_id']);
            $table->dropForeign(['groupe_id']);
            $table->dropColumn(['filiere_id', 'groupe_id']);
        });
    }
};
