(function () {
    const WELCOME = '你好，我是吴昊的 AI 助手，可以介绍他的经历、项目和技能。';
    const ENDPOINT = '/api/chat';

    const messagesEl = document.getElementById('chat-messages');
    const suggestionsEl = document.getElementById('chat-suggestions');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const errorEl = document.getElementById('chat-error');
    const errorTextEl = document.getElementById('chat-error-text');
    const errorDismissBtn = document.getElementById('chat-error-dismiss');
    const closeBtn = document.getElementById('ai-close-btn');

    const messages = [];
    let streaming = false;
    let controller = null;

    function escapeHTML(s) {
        return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function render() {
        const parts = [`<div class="chat-msg assistant">${escapeHTML(WELCOME)}</div>`];
        messages.forEach((m, i) => {
            const isLast = i === messages.length - 1;
            let content = escapeHTML(m.content);
            if (m.role === 'assistant' && isLast && streaming) {
                if (!m.content) {
                    content = '<span class="chat-thinking"><span></span><span></span><span></span></span>';
                } else {
                    content += '<span class="chat-cursor">▍</span>';
                }
            }
            parts.push(`<div class="chat-msg ${m.role}">${content}</div>`);
        });
        messagesEl.innerHTML = parts.join('');
        messagesEl.scrollTop = messagesEl.scrollHeight;
        updateSendState();
    }

    function updateSendState() {
        sendBtn.disabled = streaming || inputEl.value.trim() === '';
    }

    function showError(msg) {
        errorTextEl.textContent = msg;
        errorEl.hidden = false;
    }

    function hideError() {
        errorEl.hidden = true;
    }

    // SSE parser: keeps a rolling buffer so frames split across network chunks are reassembled
    function parseSSE(buffer, onEvent) {
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of frame.split('\n')) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    try { onEvent(JSON.parse(data)); } catch (e) { /* ignore malformed */ }
                }
            }
        }
        return buffer;
    }

    async function send(userText) {
        const text = userText.trim();
        if (streaming || !text) return;

        hideError();
        suggestionsEl.classList.add('hidden');
        messages.push({ role: 'user', content: text });
        messages.push({ role: 'assistant', content: '' });
        streaming = true;
        inputEl.value = '';
        inputEl.style.height = 'auto';
        render();

        controller = new AbortController();
        const payload = messages.slice(0, -1);

        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: payload }),
                signal: controller.signal,
            });
            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let done = false;

            while (!done) {
                const { value, done: finished } = await reader.read();
                if (finished) break;
                buffer += decoder.decode(value, { stream: true });
                buffer = parseSSE(buffer, (evt) => {
                    if (evt.type === 'text') {
                        messages[messages.length - 1].content += evt.content;
                        render();
                    } else if (evt.type === 'done') {
                        done = true;
                    } else if (evt.type === 'error') {
                        throw new Error(evt.message || '未知错误');
                    }
                });
            }

            streaming = false;
            controller = null;
            render();
        } catch (err) {
            streaming = false;
            controller = null;
            if (err.name === 'AbortError') {
                messages.pop();
                render();
                return;
            }
            messages.pop();
            render();
            showError('出错了：' + (err.message || '请稍后再试'));
        }
    }

    function abort() {
        if (controller) controller.abort();
    }

    inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 4 * parseFloat(getComputedStyle(inputEl).lineHeight)) + 'px';
        updateSendState();
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            send(inputEl.value);
        }
    });

    sendBtn.addEventListener('click', () => send(inputEl.value));

    suggestionsEl.addEventListener('click', (e) => {
        const chip = e.target.closest('.chat-chip');
        if (!chip) return;
        send(chip.dataset.q || chip.textContent);
    });

    errorDismissBtn.addEventListener('click', hideError);

    closeBtn.addEventListener('click', abort);

    render();
})();
