(function () {
  if (typeof document === 'undefined') {
    return;
  }

  const inputField = document.getElementById('ai-customer-input-field');
  const sendButton = document.getElementById('ai-customer-send');
  const messagePanel = document.getElementById('ai-customer-messages');

  if (!inputField || !sendButton || !messagePanel) {
    console.error('AI customer elements not found');
    return;
  }

  // Ensure input is focusable, even in iframe or modal
  inputField.tabIndex = 0;
  inputField.autocapitalize = 'off';
  inputField.autocomplete = 'off';
  inputField.style.zIndex = '9999';
  inputField.style.pointerEvents = 'auto';
  inputField.removeAttribute('disabled');
  inputField.focus();

  // Click anywhere on input container focuses the field
  const inputContainer = document.querySelector('#ai-customer-input');
  if (inputContainer) {
    inputContainer.style.cursor = 'text';
    inputContainer.addEventListener('click', function() {
      inputField.focus();
    });
  }

  function addMessage(text, role) {
    const wrapper = document.createElement('div');
    wrapper.className = `ai-msg-${role}`;
    const bubble = document.createElement('span');
    bubble.innerText = text;
    wrapper.appendChild(bubble);
    messagePanel.appendChild(wrapper);
    messagePanel.scrollTop = messagePanel.scrollHeight;
    return bubble;
  }

  function createBotMessage(text) {
    return addMessage(text, 'bot');
  }

  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) {
      return;
    }

    addMessage(text, 'user');
    inputField.value = '';
    inputField.focus();

    // typing wrapper we will remove when response arrives
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'ai-msg-bot';
    const typingBubble = document.createElement('span');
    typingBubble.innerText = '正在思考...';
    typingWrapper.appendChild(typingBubble);
    messagePanel.appendChild(typingWrapper);
    messagePanel.scrollTop = messagePanel.scrollHeight;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errText = await response.text();
        typingWrapper.remove();
        addMessage(`请求失败：${response.status} ${errText}`, 'bot');
        return;
      }

      const data = await response.json();
      typingWrapper.remove();
      const reply = data && (data.reply || data.message || null);
      if (reply) {
        addMessage(reply, 'bot');
      } else if (data && data.error) {
        addMessage('错误：' + data.error, 'bot');
      } else {
        addMessage('抱歉，我现在无法回答。', 'bot');
      }
    } catch (error) {
      typingWrapper.remove();
      addMessage('连接失败，请检查网络或 AI 配置。', 'bot');
    }
  }

  sendButton.addEventListener('click', function () {
    sendMessage();
  });

  inputField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  });
})();
