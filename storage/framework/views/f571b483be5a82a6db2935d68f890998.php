<?php $__env->startSection('title', 'AI Commerce OS 控制台'); ?>

<?php $__env->startSection('content'); ?>
    <div style="display: grid; gap: 24px;">
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0;">AI Commerce OS 控制台</h2>
                    <p style="margin-top: 12px; color: #4b5563; max-width: 680px;">在一个页面中统一展示 AI 运行时控制台、AI 大脑配置和运营助手入口。可直接返回后台管理页，提升总后台体验。</p>
                </div>
                <a href="<?php echo e(route('admin.dashboard')); ?>" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; background: #111827; color: #fff; text-decoration: none; font-weight: 600;">← 返回后台</a>
            </div>
            <div style="margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="ai-os-tab-button" data-tab="console" style="padding: 10px 16px; border-radius: 12px; border: 1px solid #d1d5db; background: #111827; color: #fff; cursor: pointer;">控制台</button>
                <button type="button" class="ai-os-tab-button" data-tab="settings" style="padding: 10px 16px; border-radius: 12px; border: 1px solid #d1d5db; background: #fff; color: #111827; cursor: pointer;">AI 大脑配置</button>
                <button type="button" class="ai-os-tab-button" data-tab="assistant" style="padding: 10px 16px; border-radius: 12px; border: 1px solid #d1d5db; background: #fff; color: #111827; cursor: pointer;">运营助手</button>
            </div>
        </div>

        <div id="ai-os-console-panel" style="background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; min-height: 520px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <div style="padding: 18px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <strong>AI 运行时控制台</strong>
                <p style="margin: 8px 0 0; color: #6b7280;">嵌入当前 ModaUI OS 管理后台，直接查看 AI 运行时状态和执行日志。</p>
            </div>
            <iframe src="<?php echo e(route('ai-commerce.dashboard')); ?>" style="width: 100%; height: 680px; border: none;"></iframe>
        </div>

        <div id="ai-os-settings-panel" style="display: none; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <h3>AI 大脑配置</h3>
            <p style="margin-top: 10px; color: #4b5563;">当前配置已存储在数据库中，统一通过“AI 设置”页面管理 AI 运行时、模型来源和提示词。</p>
            <div style="margin-top: 20px; display: grid; gap: 18px;">
                <div style="display: grid; grid-template-columns: repeat(2, minmax(200px, 1fr)); gap: 16px;">
                    <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                        <strong>AI 全局开关</strong>
                        <p style="margin-top: 8px; color: #111827;"><?php echo e($aiEnabled ? '已启用' : '已禁用'); ?></p>
                    </div>
                    <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                        <strong>客户端智能体</strong>
                        <p style="margin-top: 8px; color: #111827;"><?php echo e($customerAgentEnabled ? '启用' : '禁用'); ?></p>
                    </div>
                    <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                        <strong>商家智能体</strong>
                        <p style="margin-top: 8px; color: #111827;"><?php echo e($merchantAgentEnabled ? '启用' : '禁用'); ?></p>
                    </div>
                    <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                        <strong>运行时来源</strong>
                        <p style="margin-top: 8px; color: #111827;"><?php echo e(strtoupper($modelSource)); ?></p>
                    </div>
                </div>

                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <strong>当前模型配置</strong>
                    <p style="margin-top: 8px; color: #111827; word-break: break-word;"><?php echo e($modelEndpoint ?? '未配置'); ?></p>
                    <?php if(in_array($modelSource, ['llama', 'ollama'])): ?>
                        <p style="margin-top: 8px; color: #6b7280;">模型名称：<?php echo e($modelName ?? '默认'); ?></p>
                        <p style="margin-top: 8px; color: #6b7280;">温度：<?php echo e($modelTemperature ?? '默认'); ?>, 最大 Tokens：<?php echo e($modelMaxTokens ?? '默认'); ?></p>
                    <?php endif; ?>
                    <?php if($modelSource === 'ollama'): ?>
                        <p style="margin-top: 8px; color: #6b7280;">Ollam 兼容 OpenAI Chat API，可用于本地 Ollam 运行时或其他 OpenAI 兼容模型端点。</p>
                    <?php endif; ?>
                </div>

                <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                    <strong>风格与行业</strong>
                    <p style="margin-top: 8px; color: #111827;">行业：<?php echo e($industry ?? '未设置'); ?></p>
                    <p style="margin-top: 8px; color: #111827;">风格：<?php echo e($stylePreset ? ucfirst(str_replace('_', ' ', $stylePreset)) : '未设置'); ?></p>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px;">
                    <a href="<?php echo e(route('ai.settings', ['shop_id' => 1])); ?>" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #111827; color: #fff; text-decoration: none;">前往 AI 设置页面</a>
                    <a href="<?php echo e(route('ai-commerce.dashboard')); ?>" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #047857; color: #fff; text-decoration: none;">查看 AI 运行时控制台</a>
                </div>
            </div>
        </div>

        <div id="ai-os-assistant-panel" style="display: none; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
            <h3>AI 运营助手</h3>
            <p style="margin-top: 12px; color: #4b5563;">该页面提供后台商家端 AI 运营助手入口，当前依然保留在右下角聊天助手和独立页面。</p>
            <div style="margin-top: 18px; display: grid; gap: 14px;">
                <a href="<?php echo e(route('ai.assistant')); ?>" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #047857; color: #fff; text-decoration: none;">打开 AI 运营助手页面</a>
                <a href="<?php echo e(route('ai-commerce.dashboard')); ?>" style="display: inline-block; padding: 12px 18px; border-radius: 12px; background: #111827; color: #fff; text-decoration: none;">打开 AI 智能中心（运行时控制台）</a>
            </div>
            <div style="margin-top: 18px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 14px; background: #f8fafc;">
                <p><strong>说明：</strong>此处主要用于统一入口，由 AI 控制台、配置、和运营助手一起呈现。后续可继续扩展为更多内嵌模块。</p>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var buttons = document.querySelectorAll('.ai-os-tab-button');
            var consolePanel = document.getElementById('ai-os-console-panel');
            var settingsPanel = document.getElementById('ai-os-settings-panel');
            var assistantPanel = document.getElementById('ai-os-assistant-panel');

            function setActive(tab) {
                buttons.forEach(function (button) {
                    button.style.background = button.dataset.tab === tab ? '#111827' : '#fff';
                    button.style.color = button.dataset.tab === tab ? '#fff' : '#111827';
                });
                consolePanel.style.display = tab === 'console' ? 'block' : 'none';
                settingsPanel.style.display = tab === 'settings' ? 'block' : 'none';
                assistantPanel.style.display = tab === 'assistant' ? 'block' : 'none';
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    setActive(this.dataset.tab);
                });
            });

            setActive('console');
        });
    </script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/resources/views/admin/ai-os.blade.php ENDPATH**/ ?>