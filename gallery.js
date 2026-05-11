/**
 * Meazura AI & Gallery Core Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- SELECTORS ---
    const chatMessages = document.getElementById('chatMessages');
    const aiInput = document.getElementById('aiInput');
    const sendBtn = document.getElementById('sendAiBtn');
    const galleryGrid = document.getElementById('galleryGrid');
    const imageUpload = document.getElementById('imageUpload');
    
    const STORAGE_KEY = 'meazura_gallery_styles';
    let conversationHistory = [{ role: "system", content: "You are Meazura AI, a tailoring assistant." }];

    // --- 1. SECURE AI LOGIC ---
    async function handleSendMessage() {
        const query = aiInput.value.trim();
        if (!query) return;

        appendMessage('user', query);
        aiInput.value = '';
        conversationHistory.push({ role: "user", content: query });

        // Show Typing Indicator
        const typingId = 'typing-' + Date.now();
        showTyping(typingId);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationHistory })
            });

            const data = await response.json();
            document.getElementById(typingId)?.remove();

            if (data.output) {
                appendMessage('bot', data.output);
                conversationHistory.push({ role: "assistant", content: data.output });
            } else {
                appendMessage('bot', "Server Error: " + data.error);
            }
        } catch (error) {
            document.getElementById(typingId)?.remove();
            appendMessage('bot', "Connection failed. Check your deployment.");
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping(id) {
        const div = document.createElement('div');
        div.className = 'msg bot typing';
        div.id = id;
        div.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        chatMessages.appendChild(div);
    }

    // --- 2. GALLERY & LIGHTBOX LOGIC ---
    window.renderGallery = () => {
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!galleryGrid) return;

        if (styles.length === 0) {
            galleryGrid.innerHTML = '<p style="color:gray; width:100%; text-align:center;">No styles saved yet.</p>';
            return;
        }

        galleryGrid.innerHTML = styles.map((src, index) => `
            <div class="gallery-item">
                <img src="${src}" onclick="openLightbox('${src}')" alt="Style ${index}">
                <button class="del-img-btn" onclick="deleteStyle(${index})">&times;</button>
            </div>
        `).join('');
    };

    window.openLightbox = (src) => {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        `;
        lightbox.innerHTML = `
            <img src="${src}" style="max-width:90%; max-height:80%; border-radius:10px; border:2px solid #DAA520;">
            <div style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer;">&times;</div>
        `;
        lightbox.onclick = () => lightbox.remove();
        document.body.appendChild(lightbox);
    };

    window.deleteStyle = (index) => {
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY));
        styles.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        renderGallery();
    };

    // Save Local Image
    if (imageUpload) {
        imageUpload.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                styles.unshift(event.target.result);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
                renderGallery();
            };
            reader.readAsDataURL(e.target.files[0]);
        };
    }



    // Initialize
    if (sendBtn) sendBtn.onclick = handleSendMessage;
    renderGallery();
});
// 1. Define the Lightbox function globally
window.openLightbox = function(imageSrc) {
    console.log("Opening Lightbox for:", imageSrc.substring(0, 30)); // Debug log
    
    // Remove existing lightbox if one exists
    const oldLightbox = document.getElementById('active-lightbox');
    if (oldLightbox) oldLightbox.remove();

    const lightbox = document.createElement('div');
    lightbox.id = 'active-lightbox';
    lightbox.className = 'lightbox-overlay';
    
    lightbox.innerHTML = `
        <div style="position:absolute; top:20px; right:30px; color:white; font-size:40px;">&times;</div>
        <img src="${imageSrc}">
    `;

    // Close on click
    lightbox.onclick = function() {
        this.remove();
    };

    document.body.appendChild(lightbox);
};

// 2. Updated Render Function
window.renderGallery = function() {
    const STORAGE_KEY = 'meazura_gallery_styles';
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (styles.length === 0) {
        grid.innerHTML = '<p style="color:gray; text-align:center; width:100%; padding:20px;">No styles saved yet.</p>';
        return;
    }

    // Use clean template literal
    let html = '';
    styles.forEach((src, index) => {
        html += `
            <div class="gallery-item">
                <img src="${src}" onclick="window.openLightbox('${src}')">
                <button class="del-img-btn" onclick="deleteStyle(${index}); event.stopPropagation();">&times;</button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
};
