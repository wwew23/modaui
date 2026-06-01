<?php $__env->startSection('title', 'AI 设置'); ?>

<?php $__env->startSection('content'); ?>
    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px;">
            <div>
                <h2 style="margin: 0; font-size: 1.5rem; color: #111827;">AI 设置中心 (SaaS 多租户版)</h2>
                <p style="margin: 8px 0 0; color: #6b7280;">管理您的 AI 模型、API Key 以及各个端的智能体开关。</p>
            </div>
            
            <div style="display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 8px 16px; border-radius: 12px;">
                <span style="font-size: 0.9rem; font-weight: 600; color: #475569;">当前店铺:</span>
                <select onchange="window.location.href='?shop_id=' + this.value" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; font-size: 0.9rem; min-width: 200px;">
                    <option value="">-- 全局默认配置 --</option>
                    <?php $__currentLoopData = $allShops; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $s): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($s->id); ?>" <?php echo e(($shop && $shop->id == $s->id) ? 'selected' : ''); ?>><?php echo e($s->shop_domain); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
            </div>
        </div>

        <?php if(session('success')): ?>
            <div style="margin-bottom: 20px; padding: 14px 16px; background: #ecfdf5; color: #166534; border: 1px solid #d1fae5; border-radius: 12px; display: flex; align-items: center; gap: 8px;">
                <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <?php echo e(session('success')); ?>

            </div>
        <?php endif; ?>

        <form action="<?php echo e(route('ai.settings.save')); ?>" method="POST">
            <?php echo csrf_field(); ?>
            <?php if($shop): ?>
                <input type="hidden" name="shop_id" value="<?php echo e($shop->id); ?>">
            <?php endif; ?>
            <div style="display: grid; gap: 32px;">
                <!-- 基础配置 -->
                <section>
                    <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: #374151; display: flex; align-items: center; gap: 8px;">
                        <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #111827; color: #fff; border-radius: 6px; font-size: 0.8rem;">1</span>
                        核心开关
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: #f8fafc; padding: 20px; border-radius: 14px;">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" name="enabled" value="1" <?php echo e(($configs['ai_enabled'] ?? false) ? 'checked' : ''); ?> style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">全局启用 AI</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" name="customer_agent_enabled" value="1" <?php echo e(($configs['customer_agent_enabled'] ?? false) ? 'checked' : ''); ?> style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">启用顾客导购</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" name="merchant_agent_enabled" value="1" <?php echo e(($configs['merchant_agent_enabled'] ?? false) ? 'checked' : ''); ?> style="width: 18px; height: 18px;">
                            <span style="font-weight: 500;">启用运营助手</span>
                        </label>
                    </div>
                </section>

                <!-- 模型配置 -->
                <section>
                    <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: #374151; display: flex; align-items: center; gap: 8px;">
                        <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #111827; color: #fff; border-radius: 6px; font-size: 0.8rem;">2</span>
                        模型与 API 密钥
                    </h3>
                    <div style="background: #f8fafc; padding: 24px; border-radius: 14px; display: grid; gap: 20px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">模型来源</label>
                            <div style="display: flex; gap: 20px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="model_source" value="openai" <?php echo e(($configs['model_source'] ?? 'openai') === 'openai' ? 'checked' : ''); ?>>
                                    <span>OpenAI</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="model_source" value="claude" <?php echo e(($configs['model_source'] ?? '') === 'claude' ? 'checked' : ''); ?>>
                                    <span>Claude (Anthropic)</span>
                                </label>
                            </div>
                        </div>

                        <div id="panel-openai" style="display: <?php echo e(($configs['model_source'] ?? 'openai') === 'openai' ? 'grid' : 'none'); ?>; gap: 16px;">
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">OpenAI API Key</label>
                                <input type="password" name="openai_api_key" value="<?php echo e($configs['openai_api_key'] ?? ''); ?>" placeholder="sk-..." style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            </div>
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">模型名称</label>
                                <select name="openai_model" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                    <option value="gpt-4o" <?php echo e(($configs['openai_model'] ?? '') === 'gpt-4o' ? 'selected' : ''); ?>>gpt-4o</option>
                                    <option value="gpt-4-turbo" <?php echo e(($configs['openai_model'] ?? '') === 'gpt-4-turbo' ? 'selected' : ''); ?>>gpt-4-turbo</option>
                                    <option value="gpt-3.5-turbo" <?php echo e(($configs['openai_model'] ?? '') === 'gpt-3.5-turbo' ? 'selected' : ''); ?>>gpt-3.5-turbo</option>
                                </select>
                            </div>
                        </div>

                        <div id="panel-claude" style="display: <?php echo e(($configs['model_source'] ?? '') === 'claude' ? 'grid' : 'none'); ?>; gap: 16px;">
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">Claude API Key</label>
                                <input type="password" name="claude_api_key" value="<?php echo e($configs['claude_api_key'] ?? ''); ?>" placeholder="sk-ant-..." style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            </div>
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">模型名称</label>
                                <select name="claude_model" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                    <option value="claude-3-5-sonnet-20240620" <?php echo e(($configs['claude_model'] ?? '') === 'claude-3-5-sonnet-20240620' ? 'selected' : ''); ?>>Claude 3.5 Sonnet</option>
                                    <option value="claude-3-opus-20240229" <?php echo e(($configs['claude_model'] ?? '') === 'claude-3-opus-20240229' ? 'selected' : ''); ?>>Claude 3 Opus</option>
                                    <option value="claude-3-haiku-20240307" <?php echo e(($configs['claude_model'] ?? '') === 'claude-3-haiku-20240307' ? 'selected' : ''); ?>>Claude 3 Haiku</option>
                                </select>
                            </div>
                        </div>

                        <!-- Martfury Sidekick API 配置 -->
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1e293b;">Martfury API 接口配置 (Sidekick 专用)</label>
                            <div style="display: grid; gap: 16px;">
                                <div style="display: grid; gap: 8px;">
                                    <label style="font-size: 0.9rem; font-weight: 500;">API Base URL</label>
                                    <input type="text" name="martfury_api_url" value="<?php echo e($configs['martfury_api_url'] ?? 'https://modaui.com/api'); ?>" placeholder="https://your-domain.com/api" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                </div>
                                <div style="display: grid; gap: 8px;">
                                    <label style="font-size: 0.9rem; font-weight: 500;">API Key / Token</label>
                                    <input type="password" name="martfury_api_key" value="<?php echo e($configs['martfury_api_key'] ?? ''); ?>" placeholder="Enter API key" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Prompt 设定 -->
                <section style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #edf2f7;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="background: #e0e7ff; padding: 8px; border-radius: 10px;">
                            <svg style="width: 24px; height: 24px; color: #4f46e5;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;">3 智能体记忆与偏好 (Sidekick 专用)</h2>
                    </div>
                    
                    <div style="display: grid; gap: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">品牌语气 (Tone of Voice)</label>
                                <input type="text" name="agent_tone" value="<?php echo e($configs['agent_tone'] ?? '专业、简洁、富有洞察力'); ?>" placeholder="例如：亲切友好、幽默、严肃专业" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            </div>
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">目标客群 (Target Audience)</label>
                                <input type="text" name="agent_audience" value="<?php echo e($configs['agent_audience'] ?? '所有进店顾客'); ?>" placeholder="例如：18-25岁大学生、白领女性" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            </div>
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <label style="font-size: 0.9rem; font-weight: 500;">核心运营目标 (Priority Goals)</label>
                            <input type="text" name="agent_goals" value="<?php echo e($configs['agent_goals'] ?? '提高客单价, 清理库存'); ?>" placeholder="多个目标请用逗号隔开" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <label style="font-size: 0.9rem; font-weight: 500;">禁用词/禁忌话题 (Forbidden Topics)</label>
                            <textarea name="agent_forbidden" rows="2" placeholder="例如：不要提到最低价、不要承诺不可能实现的效果" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-family: inherit;"><?php echo e($configs['agent_forbidden'] ?? ''); ?></textarea>
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <label style="font-size: 0.9rem; font-weight: 500;">商家侧系统提示词 (Merchant System Prompt)</label>
                            <textarea name="merchant_prompt" rows="4" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-family: inherit;"><?php echo e($configs['merchant_prompt'] ?? ''); ?></textarea>
                        </div>
                    </div>
                </section>

                <section style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #edf2f7;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="background: #fee2e2; padding: 8px; border-radius: 10px;">
                            <svg style="width: 24px; height: 24px; color: #ef4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;">4 顾客侧 AI 导购设定 (Week 2/3)</h2>
                    </div>

                    <div style="display: grid; gap: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">品牌主色调 (Primary Color)</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="color" name="frontend_primary_color" value="<?php echo e($configs['frontend_primary_color'] ?? '#008060'); ?>" style="width: 44px; height: 44px; padding: 0; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
                                    <input type="text" value="<?php echo e($configs['frontend_primary_color'] ?? '#008060'); ?>" readonly style="flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; color: #64748b; font-family: monospace;">
                                </div>
                            </div>
                            <div style="display: grid; gap: 8px;">
                                <label style="font-size: 0.9rem; font-weight: 500;">入口悬浮文案</label>
                                <input type="text" name="frontend_floating_text" value="<?php echo e($configs['frontend_floating_text'] ?? '有问题？问 AI 导购'); ?>" placeholder="例如：有问题？问 AI 导购" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                            </div>
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <label style="font-size: 0.9rem; font-weight: 500;">初始欢迎语 (Welcome Message)</label>
                            <textarea name="frontend_welcome_message" rows="2" placeholder="例如：嗨！我是您的购物助手，我可以帮您找商品、查订单..." style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;"><?php echo e($configs['frontend_welcome_message'] ?? ''); ?></textarea>
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <label style="font-size: 0.9rem; font-weight: 500;">导购语气偏好 (Tone)</label>
                            <select name="frontend_tone" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;">
                                <option value="friendly" <?php echo e(($configs['frontend_tone'] ?? '') === 'friendly' ? 'selected' : ''); ?>>亲切友好 (推荐)</option>
                                <option value="professional" <?php echo e(($configs['frontend_tone'] ?? '') === 'professional' ? 'selected' : ''); ?>>专业严谨</option>
                                <option value="humorous" <?php echo e(($configs['frontend_tone'] ?? '') === 'humorous' ? 'selected' : ''); ?>>风趣幽默</option>
                                <option value="minimalist" <?php echo e(($configs['frontend_tone'] ?? '') === 'minimalist' ? 'selected' : ''); ?>>极简直接</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div style="padding-top: 20px; border-top: 1px solid #f3f4f6; display: flex; gap: 12px;">
                    <button type="submit" style="background: #111827; color: #fff; border: none; border-radius: 12px; padding: 14px 40px; font-weight: 700; cursor: pointer; transition: all 0.2s; hover: background: #000;">
                        保存所有配置
                    </button>
                    <button type="button" onclick="history.back()" style="background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 40px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        ← 返回
                    </button>
                </div>
            </div>
        </form>

        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const openaiRadio = document.querySelector('input[value="openai"]');
                const claudeRadio = document.querySelector('input[value="claude"]');
                const openaiPanel = document.getElementById('panel-openai');
                const claudePanel = document.getElementById('panel-claude');

                function togglePanels() {
                    if (openaiRadio.checked) {
                        openaiPanel.style.display = 'grid';
                        claudePanel.style.display = 'none';
                    } else {
                        openaiPanel.style.display = 'none';
                        claudePanel.style.display = 'grid';
                    }
                }

                openaiRadio.addEventListener('change', togglePanels);
                claudeRadio.addEventListener('change', togglePanels);
            });
        </script>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/resources/views/admin/ai-settings.blade.php ENDPATH**/ ?>