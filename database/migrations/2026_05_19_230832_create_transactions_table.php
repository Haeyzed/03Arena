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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference_uuid');
            $table->unique(['user_id', 'reference_uuid']);
            $table->string('client_name')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('transaction_type')->nullable();
            $table->string('status')->nullable();
            $table->dateTime('creation_date')->nullable();
            $table->dateTime('capture_date')->nullable();
            $table->dateTime('value_date')->nullable();
            $table->string('currency', 3)->nullable();
            $table->decimal('net_amount', 15, 2)->nullable();
            $table->decimal('gross_amount', 15, 2)->nullable();
            $table->decimal('fee', 15, 2)->nullable();
            $table->decimal('calc_fee', 15, 2)->nullable();
            $table->string('counterparty_reference')->nullable();
            $table->string('counterparty_name')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('cross_border')->nullable();
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'creation_date']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
