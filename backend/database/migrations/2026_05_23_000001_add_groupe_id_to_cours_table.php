<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            $table->unsignedBigInteger('groupe_id')->nullable()->after('filiere_id');
            $table->foreign('groupe_id')
                  ->references('id')
                  ->on('groupes')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            $table->dropForeign(['groupe_id']);
            $table->dropColumn('groupe_id');
        });
    }
};
