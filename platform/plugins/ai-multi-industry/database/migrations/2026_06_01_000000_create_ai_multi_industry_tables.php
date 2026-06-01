<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_industries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('emoji')->nullable();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('ai_industry_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->constrained('ai_industries')->cascadeOnDelete();
            $table->string('name');
            $table->string('role');
            $table->text('system_prompt')->nullable();
            $table->string('model')->default('gpt-4');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->nullable()->constrained('ai_industries')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('ai_industry_employees')->nullOnDelete();
            $table->string('merchant_id')->nullable();
            $table->text('user_message');
            $table->text('ai_response')->nullable();
            $table->integer('confidence')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_industry_employees');
        Schema::dropIfExists('ai_industries');
    }
};
