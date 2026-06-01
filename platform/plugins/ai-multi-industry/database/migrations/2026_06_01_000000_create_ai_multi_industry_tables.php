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
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('emoji')->nullable();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index('enabled');
            $table->index('slug');
        });

        Schema::create('ai_industry_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->constrained('ai_industries')->cascadeOnDelete();
            $table->string('name');
            $table->string('role');
            $table->string('avatar_url')->nullable();
            $table->longText('system_prompt')->nullable();
            $table->string('model')->default('gpt-4');
            $table->decimal('temperature', 3, 2)->default(0.7);
            $table->integer('max_tokens')->default(2048);
            $table->boolean('enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['industry_id', 'enabled']);
            $table->index('role');
        });

        Schema::create('ai_chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->nullable()->constrained('ai_industries')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('ai_industry_employees')->nullOnDelete();
            $table->string('merchant_id')->nullable();
            $table->string('session_token')->unique();
            $table->integer('total_messages')->default(0);
            $table->integer('total_tokens')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['merchant_id', 'ended_at']);
            $table->index('session_token');
        });

        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('ai_chat_sessions')->cascadeOnDelete();
            $table->foreignId('industry_id')->nullable()->constrained('ai_industries')->nullOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained('ai_industry_employees')->nullOnDelete();
            $table->string('merchant_id')->nullable();
            $table->string('role')->default('user'); // user, assistant, system
            $table->longText('user_message')->nullable();
            $table->longText('ai_response')->nullable();
            $table->integer('confidence')->nullable();
            $table->integer('tokens_used')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['session_id', 'created_at']);
            $table->index(['industry_id', 'employee_id']);
            $table->index('merchant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_chat_sessions');
        Schema::dropIfExists('ai_industry_employees');
        Schema::dropIfExists('ai_industries');
    }
};
