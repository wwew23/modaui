// 调试并强制聚焦输入（支持 ai-chat / sidekick / ai-customer 三种常见 id）
(function(){
  const ids = ['user-input','chat-input','ai-customer-input-field'];
  let el = null;
  for (const id of ids) { el = document.getElementById(id); if (el) break; }
  console.log('found input:', !!el, el);
  if (!el) return;
  el.tabIndex = 0;
  el.autocapitalize = 'off';
  el.style.zIndex = '9999';
  el.style.pointerEvents = 'auto';
  el.removeAttribute('disabled');
  el.focus();
  el.addEventListener('keydown', (e)=>{ console.log('keydown', e.key, 'isComposing', e.isComposing); });
  // 点击容器也聚焦
  const container = document.querySelector('.input-area') || document.querySelector('#ai-customer-input') || document.querySelector('.ai-chat-main');
  if (container) container.addEventListener('click', ()=>{ el.focus(); console.log('container click -> focus'); });
  console.log('forced focus and listeners attached');
})();

<?php $__env->startSection('content'); ?>
<div id="ai-sidekick-container" class="ai-sidekick-wrapper" style="display: flex; height: calc(100vh - 100px); background: #f4f6f8; margin: -20px;">
    <!-- Left Sidebar: Context/History -->
    <div class="ai-sidebar" style="width: 280px; background: #fff; border-right: 1px solid #dfe3e8; display: flex; flex-direction: column;">
        <div style="padding: 20px; border-bottom: 1px solid #dfe3e8;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0;">LarAgent Sidekick</h3>
            <p style="font-size: 12px; color: #637381; margin: 5px 0 0;"><?php echo e($shop->shop_domain ?? 'No shop connected'); ?></p>
        </div>
        <div class="sidebar-menu" style="flex: 1; overflow-y: auto; padding: 10px;">
            <div style="padding: 10px; border-radius: 8px; background: #f0f2f4; margin-bottom: 10px; cursor: pointer;">
                <div style="font-weight: 500; font-size: 14px;">当前会话</div>
                <div style="font-size: 12px; color: #637381;">正在诊断店铺表现...</div>
            </div>
            <!-- Future history items -->
        </div>
        <div style="padding: 15px; border-top: 1px solid #dfe3e8;">
            <a href="<?php echo e(route('ai.settings')); ?>" class="btn btn-outline-secondary btn-sm btn-block">
                <i class="ti ti-settings"></i> 助手设置
            </a>
        </div>
    </div>

    <!-- Main Chat Area -->
    <div class="ai-chat-main" style="flex: 1; display: flex; flex-direction: column; background: #fff; position: relative;">
        <!-- Chat Header -->
        <div style="padding: 15px 25px; border-bottom: 1px solid #dfe3e8; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: #47c1bf;"></div>
                <span style="font-weight: 600;">AI 商家助手正在线</span>
            </div>
            <div class="actions">
                <button class="btn btn-icon btn-light btn-sm" title="清除记录"><i class="ti ti-trash"></i></button>
            </div>
        </div>

        <!-- Messages -->
        <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 20px;">
            <!-- Bot Message -->
            <div class="message bot" style="display: flex; gap: 12px; max-width: 85%;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #008060; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="ti ti-robot"></i>
                </div>
                <div style="background: #f1f2f4; padding: 12px 16px; border-radius: 0 16px 16px 16px; font-size: 14px; line-height: 1.5;">
                    你好！我是你的 AI 商业助手。我可以帮你分析销量、优化产品描述或创建促销活动。今天有什么我可以帮你的吗？
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div style="padding: 20px 25px; border-top: 1px solid #dfe3e8; background: #fff;">
            <div class="input-group" style="background: #f4f6f8; border: 1px solid #dfe3e8; border-radius: 24px; padding: 5px 15px; display: flex; align-items: center;">
                <input type="text" id="chat-input" placeholder="向 Sidekick 提问，例如：‘帮我看看上周的销量’" style="flex: 1; border: none; background: transparent; padding: 10px; outline: none; font-size: 14px;">
                <button id="send-btn" class="btn btn-primary" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;">
                    <i class="ti ti-send"></i>
                </button>
            </div>
            <div style="font-size: 11px; color: #919eab; text-align: center; margin-top: 10px;">
                AI 可能会产生误差，请在执行关键操作前核对信息。
            </div>
        </div>
    </div>

    <!-- Right Sidebar: Dashboard -->
    <div class="ai-dashboard" style="width: 320px; background: #f9fafb; border-left: 1px solid #dfe3e8; padding: 20px; overflow-y: auto;">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
            <i class="ti ti-chart-bar" style="color: #008060;"></i> 店铺实时概览
        </h4>

        <!-- KPI Cards -->
        <div id="kpi-cards" style="display: grid; gap: 15px;">
            <div class="kpi-card" style="background: #fff; padding: 15px; border-radius: 12px; border: 1px solid #dfe3e8; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="font-size: 12px; color: #637381;">总销售额 (7天)</div>
                <div id="kpi-sales" style="font-size: 20px; font-weight: 700; color: #212b36; margin-top: 5px;">加载中...</div>
                <div style="font-size: 11px; color: #008060; margin-top: 5px;"><i class="ti ti-arrow-up"></i> 12.5%</div>
            </div>
            <div class="kpi-card" style="background: #fff; padding: 15px; border-radius: 12px; border: 1px solid #dfe3e8; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="font-size: 12px; color: #637381;">订单数</div>
                <div id="kpi-orders" style="font-size: 20px; font-weight: 700; color: #212b36; margin-top: 5px;">加载中...</div>
            </div>
        </div>

        <h4 style="font-size: 14px; font-weight: 600; margin: 25px 0 15px;">热销产品</h4>
        <div id="top-products-list" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Product items -->
            <div style="font-size: 12px; color: #919eab;">暂无数据</div>
        </div>
    </div>
</div>

<style>
    .ai-sidekick-wrapper .btn-primary { background: #008060; border-color: #008060; }
    .ai-sidekick-wrapper .btn-primary:hover { background: #006e52; border-color: #006e52; }
    .message.user { align-self: flex-end; flex-direction: row-reverse; max-width: 85%; }
    .message.user > div:last-child { background: #008060; color: #fff; border-radius: 16px 0 16px 16px; }
    .typing-indicator { font-style: italic; color: #919eab; font-size: 12px; margin-top: 5px; }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');
        const shopId = "<?php echo e($shop->id ?? ''); ?>";

        if (!chatInput || !sendBtn || !chatMessages) {
            console.error('Sidekick chat elements not found');
            return;
        }

        // Ensure input is focusable and clickable
        chatInput.tabIndex = 0;
        chatInput.autocapitalize = 'off';
        chatInput.autocomplete = 'off';
        chatInput.style.zIndex = '10';
        chatInput.style.pointerEvents = 'auto';
        chatInput.removeAttribute('disabled');
        chatInput.focus();

        // Click on input-group also focuses the input
        const inputGroup = document.querySelector('.input-group');
        if (inputGroup) {
            inputGroup.style.cursor = 'text';
            inputGroup.addEventListener('click', function() {
                chatInput.focus();
            });
        }

        if (!shopId) {
            appendMessage('bot', '错误：未找到绑定的 Shopify 店铺。请先在设置中完成绑定。');
            return;
        }

        // Initial KPI load
        fetchKPI();

        function appendMessage(role, content) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${role}`;
            msgDiv.style.display = 'flex';
            msgDiv.style.gap = '12px';
            msgDiv.style.maxWidth = '85%';
            if (role === 'user') {
                msgDiv.style.alignSelf = 'flex-end';
                msgDiv.style.flexDirection = 'row-reverse';
            }

            const avatar = document.createElement('div');
            avatar.style.width = '36px';
            avatar.style.height = '36px';
            avatar.style.borderRadius = '50%';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.flexShrink = '0';
            
            if (role === 'bot') {
                avatar.style.background = '#008060';
                avatar.style.color = '#fff';
                avatar.innerHTML = '<i class="ti ti-robot"></i>';
            } else {
                avatar.style.background = '#dfe3e8';
                avatar.style.color = '#637381';
                avatar.innerHTML = '<i class="ti ti-user"></i>';
            }

            const bubble = document.createElement('div');
            bubble.style.padding = '12px 16px';
            bubble.style.fontSize = '14px';
            bubble.style.lineHeight = '1.5';
            
            if (role === 'bot') {
                bubble.style.background = '#f1f2f4';
                bubble.style.borderRadius = '0 16px 16px 16px';
                bubble.innerHTML = content;
            } else {
                bubble.style.background = '#008060';
                bubble.style.color = '#fff';
                bubble.style.borderRadius = '16px 0 16px 16px';
                bubble.innerText = content;
            }

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubble);
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            chatInput.value = '';
            appendMessage('user', text);

            // Add typing indicator
            const typing = document.createElement('div');
            typing.className = 'typing-indicator';
            typing.innerText = 'Sidekick 正在思考...';
            chatMessages.appendChild(typing);

            try {
                const response = await fetch("<?php echo e(route('ai.chat.v2')); ?>", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': "<?php echo e(csrf_token()); ?>"
                    },
                    body: JSON.stringify({
                        message: text,
                        mode: 'merchant',
                        shopId: shopId
                    })
                });

                const data = await response.json();
                typing.remove();

                if (data.success) {
                    appendMessage('bot', data.reply);
                    // 如果回复中包含某些关键词，触发 KPI 更新
                    if (text.includes('销量') || text.includes('产品')) {
                        fetchKPI();
                    }
                } else {
                    appendMessage('bot', '抱歉，我现在遇到了一点问题：' + (data.error || '未知错误'));
                }
            } catch (error) {
                typing.remove();
                appendMessage('bot', '连接服务器失败，请稍后再试。');
            }
        }

        async function fetchKPI() {
            try {
                const response = await fetch(`/admin/shopify/${shopId}/kpi/summary?days=7`);
                const data = await response.json();
                
                document.getElementById('kpi-sales').innerText = data.currency + ' ' + data.totalSales.toLocaleString();
                document.getElementById('kpi-orders').innerText = data.orderCount;

                // Fetch Top Products
                const tpRes = await fetch(`/admin/shopify/${shopId}/top-products?limit=3`);
                const tpData = await tpRes.json();
                const list = document.getElementById('top-products-list');
                list.innerHTML = '';
                
                if (tpData.items && tpData.items.length > 0) {
                    tpData.items.forEach(item => {
                        const itemDiv = document.createElement('div');
                        itemDiv.style.background = '#fff';
                        itemDiv.style.padding = '10px';
                        itemDiv.style.borderRadius = '8px';
                        itemDiv.style.border = '1px solid #dfe3e8';
                        itemDiv.style.fontSize = '12px';
                        itemDiv.innerHTML = `
                            <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                            <div style="display: flex; justify-content: space-between; margin-top: 5px; color: #637381;">
                                <span>销量: ${item.totalQuantity}</span>
                                <span style="color: #008060;">$${item.totalSales}</span>
                            </div>
                        `;
                        list.appendChild(itemDiv);
                    });
                } else {
                    list.innerHTML = '<div style="font-size: 12px; color: #919eab;">暂无销售数据</div>';
                }
            } catch (e) {
                console.error('KPI Load Error', e);
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    });
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('core/base::layouts.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /www/wwwroot/modaui.com/platform/plugins/ai-commerce/resources/views/sidekick.blade.php ENDPATH**/ ?>