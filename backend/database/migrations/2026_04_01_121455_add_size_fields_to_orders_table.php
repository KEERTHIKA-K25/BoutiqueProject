<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // e.g. 'XS','S','M','L','XL','XXL','Custom'
            $table->string('selected_size')->nullable()->after('shipping_pincode');
            // JSON string: {"bust":"90","waist":"70","hips":"95","length":"120"}
            $table->text('custom_measurements')->nullable()->after('selected_size');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['selected_size', 'custom_measurements']);
        });
    }
};
