<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title>AI Assistant</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #111827; color: #fff; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        .header { background: #1f2937; padding: 15px 20px; border-bottom: 1px solid #374151; display: flex; align-items: center; gap: 10px; }
        .bot-icon { width: 30px; height: 30px; background: #fbbf24; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #111; font-weight: bold; }
        .messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .msg { max-width: 85%; padding: 12px 16px; border-radius: 15px; font-size: 14px; line-height: 1.5; }
        .msg-bot { align-self: flex-start; background: #374151; border-bottom-left-radius: 2px; }
        .msg-user { align-self: flex-end; background: #fbbf24; color: #111; border-bottom-right-radius: 2px; }
        .input-area { background: #1f2937; padding: 15px; border-top: 1px solid #374151; display: flex; gap: 10px; }
        input { flex: 1; background: #374151; border: 1px solid #4b5563; border-radius: 10px; padding: 10px 15px; color: #fff; outline: none; }
        button { background: #fbbf24; color: #111; border: none; border-radius: 10px; padding: 0 20px; font-weight: bold; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <div class="bot-icon">AI</div>
        <strong>ModaUI AI 助手</strong>
    </div>
    <div class="messages" id="chat-box">
        <div class="msg msg-bot">您好！我是您的 AI 助手。请问有什么我可以帮您的？</div>
    </div>
    <form class="input-area" id="chat-form">
        <input type="text" id="user-input" placeholder="输入消息..." autocomplete="off">
        <button type="submit">发送</button>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const chatBox = document.getElementById('chat-box');
            const chatForm = document.getElementById('chat-form');
            const userInput = document.getElementById('user-input');

            if (!chatBox || !chatForm || !userInput) {
                console.error('AI chat DOM elements not found');
                return;
            }

            // Ensure input is focusable, even in iframe
            userInput.autocomplete = 'off';
            userInput.spellcheck = false;
            userInput.tabIndex = 0;
            userInput.autocapitalize = 'off';
            userInput.style.zIndex = '10';
            userInput.style.pointerEvents = 'auto';
            userInput.removeAttribute('disabled');
            userInput.focus();

            // Click on input-area also focuses the input field
            const inputArea = document.querySelector('.input-area');
            if (inputArea) {
                inputArea.style.cursor = 'text';
                inputArea.addEventListener('click', function (e) {
                    userInput.focus();
                });
            }

            chatForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                await sendMessage();
            });

            // IME composition handling: some browsers don't set event.isComposing reliably
            let _isComposing = false;
            userInput.addEventListener('compositionstart', function () { _isComposing = true; });
            userInput.addEventListener('compositionend', function () { _isComposing = false; });
            userInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && !event.shiftKey && !_isComposing) {
                    event.preventDefault();
                    sendMessage();
                }
            });

            async function sendMessage() {
                const text = userInput.value.trim();
                if (!text) {
                    return;
                }

                addMessage(text, 'user');
                userInput.value = '';
                userInput.focus();

                // typing indicator element (remove when reply arrives)
                    const typingEl = document.createElement('div');
                    typingEl.className = 'msg msg-bot typing-indicator';
                    // Use textContent to avoid unexpected HTML parsing and ensure text is visible
                    typingEl.textContent = '正在思考...';
                chatBox.appendChild(typingEl);
                chatBox.scrollTop = chatBox.scrollHeight;

                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    let mode = urlParams.get('mode') || 'storefront_agent';
                    if (mode === 'chat') {
                        mode = 'storefront_agent';
                    }

                    let parentShopId = null;
                    try {
                        parentShopId = window.parent?.shopId || window.parent?.shop_id || window.parent?.Shopify?.shop?.id || window.parent?.shopify_shop_id || null;
                    } catch (error) {
                        parentShopId = null;
                    }

                    const shopId = urlParams.get('shopId') || urlParams.get('shop_id') || parentShopId || '1';
                    console.debug('AI chat request', { mode, shopId, message: text });

                    const tokenMeta = document.querySelector('meta[name="csrf-token"]');
                    const csrfToken = tokenMeta ? tokenMeta.content : window.csrfToken || '';

                    const response = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify({ message: text, mode, shopId })
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        typingEl.remove();
                        addMessage('请求失败：' + response.status + ' ' + errText, 'bot');
                        return;
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (!contentType.includes('application/json')) {
                        const rawText = await response.text();
                        typingEl.remove();
                        console.error('AI 响应不是 JSON', contentType, rawText);
                        addMessage('响应不是 JSON：' + rawText, 'bot');
                        return;
                    }

                    const data = await response.json();
                    typingEl.remove();
                    const reply = data && (data.reply || data.message || null);
                    if (reply) {
                        addMessage(reply, 'bot');
                    } else if (data && data.error) {
                        addMessage('错误：' + data.error, 'bot');
                    } else {
                        addMessage('抱歉，我现在无法回答。', 'bot');
                    }
                } catch (err) {
                    typingEl.remove();
                    addMessage('连接失败，请检查配置。', 'bot');
                    console.error('AI 请求异常', err);
                }
            }

            function addMessage(text, role) {
                const div = document.createElement('div');
                div.className = `msg msg-${role}`;
                // Use textContent to safely render text and avoid HTML injection
                div.textContent = text;
                // Explicitly set color so messages remain visible even if global styles change
                if (role === 'user') {
                    div.style.color = '#111';
                    div.style.background = '#fbbf24';
                } else {
                    div.style.color = '#fff';
                    div.style.background = '#374151';
                }
                chatBox.appendChild(div);
                chatBox.scrollTop = chatBox.scrollHeight;
                return div;
            }
        });
    </script>
</body>
</html>
<?php /**PATH /www/wwwroot/modaui.com/resources/views/ai-chat.blade.php ENDPATH**/ ?>