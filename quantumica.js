/* ======================================================
   QUANTUMICA PAGE — Interactive Canvas & AI Chat
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initQuantumCanvas();
    initQuantumChat();
});

/* ══════════════════════════════════════════════════════
   1. INTERACTIVE 3D QUANTUM CANVAS
   ══════════════════════════════════════════════════════ */
function initQuantumCanvas() {
    const canvas = document.getElementById('quantum-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000, moved: false };

    // Colors based on the CSS theme
    const colors = [
        { r: 6, g: 182, b: 212 },   // Cyan
        { r: 59, g: 130, b: 246 },  // Blue
        { r: 16, g: 185, b: 129 },  // Emerald
        { r: 168, g: 85, b: 247 }   // Purple (accent)
    ];

    class QuantumParticle {
        constructor() {
            this.reset();
            this.z = Math.random() * 2000; // Start at random depth
        }

        reset() {
            this.x = (Math.random() - 0.5) * width * 2;
            this.y = (Math.random() - 0.5) * height * 2;
            this.z = 2000;
            this.vz = (Math.random() * 2 + 0.5) * -1.5; // Move towards viewer
            this.baseRadius = Math.random() * 1.5 + 0.5;

            const c = colors[Math.floor(Math.random() * colors.length)];
            this.color = `${c.r}, ${c.g}, ${c.b}`;

            // Entanglement lines probability
            this.isEntangled = Math.random() > 0.8;
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.05;
        }

        update() {
            this.z += this.vz;
            this.angle += this.spinSpeed;

            // Mouse repulsion (quantum uncertainty principle effect)
            if (mouse.moved) {
                // Project 3D to 2D for mouse check
                const scale = 800 / (800 + this.z);
                const px = width / 2 + this.x * scale;
                const py = height / 2 + this.y * scale;

                const dx = px - mouse.x;
                const dy = py - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x += dx * force * 0.2;
                    this.y += dy * force * 0.2;
                }
            }

            if (this.z < 1) {
                this.reset();
            }
        }

        draw(ctx) {
            const scale = 800 / (800 + this.z);
            const px = width / 2 + this.x * scale;
            const py = height / 2 + this.y * scale;
            const r = this.baseRadius * scale;

            if (px < 0 || px > width || py < 0 || py > height) return;

            const alpha = Math.min(1, (2000 - this.z) / 1000);

            // Core particle
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
            ctx.fill();

            // Probability cloud (glow)
            if (r > 1) {
                ctx.beginPath();
                ctx.arc(px, py, r * 4, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
                grad.addColorStop(0, `rgba(${this.color}, ${alpha * 0.4})`);
                grad.addColorStop(1, `rgba(${this.color}, 0)`);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // Draw entangled connections to nearby particles
            return { px, py, scale, alpha };
        }
    }

    function init() {
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.moved = true;
        });

        // Auto-move mouse in a figure-8 if user hasn't moved it
        let autoTime = 0;
        setInterval(() => {
            if (!mouse.moved) {
                autoTime += 0.02;
                mouse.x = width / 2 + Math.sin(autoTime) * 300;
                mouse.y = height / 2 + Math.sin(autoTime * 2) * 150;
            }
        }, 16);

        resize();

        for (let i = 0; i < 400; i++) {
            particles.push(new QuantumParticle());
        }

        animate();
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    function animate() {
        // Subtle trail effect
        ctx.fillStyle = 'rgba(2, 4, 10, 0.3)';
        ctx.fillRect(0, 0, width, height);

        const projected = [];

        particles.forEach(p => {
            p.update();
            const proj = p.draw(ctx);
            if (proj && p.isEntangled) {
                projected.push({ p: proj, color: p.color });
            }
        });

        // Draw quantum entanglement lines (connecting close particles)
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projected.length; i++) {
            const p1 = projected[i];
            for (let j = i + 1; j < projected.length; j++) {
                const p2 = projected[j];
                const dx = p1.p.px - p2.p.px;
                const dy = p1.p.py - p2.p.py;
                const distSq = dx * dx + dy * dy;

                if (distSq < 15000) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / 122) * Math.min(p1.p.alpha, p2.p.alpha) * 0.3;
                    if (alpha > 0) {
                        ctx.beginPath();
                        ctx.moveTo(p1.p.px, p1.p.py);
                        ctx.lineTo(p2.p.px, p2.p.py);

                        // Gradient line
                        const grad = ctx.createLinearGradient(p1.p.px, p1.p.py, p2.p.px, p2.p.py);
                        grad.addColorStop(0, `rgba(${p1.color}, ${alpha})`);
                        grad.addColorStop(1, `rgba(${p2.color}, ${alpha})`);
                        ctx.strokeStyle = grad;
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }

    init();
}

/* ══════════════════════════════════════════════════════
   2. DEEPSEEK API CHATBOT
   ══════════════════════════════════════════════════════ */
function initQuantumChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const API_KEY = window.QUANTUM_API_KEY || '';
    
    if (!API_KEY) {
        console.warn('API_KEY is missing. Please add it to config.js.');
    }

    // Chat history for context
    let conversationHistory = [
        {
            role: 'system',
            content: `You are the Quantumica Intelligence, an advanced AI specialized ONLY in quantum theory, quantum mechanics, quantum computing, and related physics. 
      Your persona is highly intelligent, slightly mysterious, and deeply scientific. You speak with awe about the universe.
      If a user asks about something completely unrelated to quantum physics or science, politely decline to answer and guide them back to the quantum realm.
      IMPORTANT: You support all languages natively. You MUST always respond in the exact same language the user uses to speak to you.
      IMPORTANT: You MUST format all mathematical formulas using LaTeX. Use $$ for block/display math (e.g., $$E = mc^2$$) and $ for inline math (e.g., $E = mc^2$). Do not use brackets like \\[ \\] for math.
      Format your responses using Markdown for readability. Be concise but deep.`
        }
    ];

    // Auto-resize textarea
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = '52px';
    });

    // Enter to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    sendBtn.addEventListener('click', handleSend);

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Reset input
        chatInput.value = '';
        chatInput.style.height = '52px';

        // Add user message to UI
        appendMessage('user', text);

        // Add to history
        conversationHistory.push({ role: 'user', content: text });

        // Scroll to bottom
        scrollToBottom();

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            const data = await response.json();

            // Remove typing indicator
            removeTypingIndicator(typingId);

            if (data.choices && data.choices.length > 0) {
                const aiMessage = data.choices[0].message.content;

                // Add to history
                conversationHistory.push({ role: 'assistant', content: aiMessage });

                // Add to UI (rendered with marked.js)
                appendMessage('ai', aiMessage, true);
            } else {
                throw new Error('Invalid response from quantum core.');
            }

        } catch (error) {
            console.error('Quantum communication error:', error);
            removeTypingIndicator(typingId);
            appendMessage('ai', '*Interference detected in the quantum field. Communication failed. Please try again.*', true);
        }
    }

    function appendMessage(role, content, isMarkdown = false) {
        const row = document.createElement('div');
        row.className = `q-msg-row ${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'q-msg-bubble';

        if (isMarkdown && typeof marked !== 'undefined') {
            bubble.innerHTML = marked.parse(content);
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(bubble, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false }
                    ],
                    throwOnError: false
                });
            }
        } else {
            bubble.textContent = content;
        }

        row.appendChild(bubble);
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const row = document.createElement('div');
        row.className = 'q-msg-row ai';
        row.id = id;

        const bubble = document.createElement('div');
        bubble.className = 'q-msg-bubble q-typing-indicator';
        bubble.innerHTML = '<span></span><span></span><span></span>';

        row.appendChild(bubble);
        chatMessages.appendChild(row);
        scrollToBottom();

        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        // Small timeout to allow DOM to update rendering
        setTimeout(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 10);
    }
}
