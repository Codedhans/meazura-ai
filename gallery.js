document.addEventListener('DOMContentLoaded', () => {
    // --- GALLERY LOGIC ---
    const galleryOverlay = document.getElementById('galleryOverlay');
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    const closeGalleryBtn = document.getElementById('closeGallery');
    const galleryGrid = document.getElementById('galleryGrid');
    const imageUpload = document.getElementById('imageUpload');
    const pinBtn = document.getElementById('pinBtn');
    const STORAGE_KEY = 'meazura_gallery_styles';

    openGalleryBtn.onclick = () => {
        galleryOverlay.classList.add('active');
        renderGallery();
    };
    
    closeGalleryBtn.onclick = () => galleryOverlay.classList.remove('active');

    function renderGallery() {
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        galleryGrid.innerHTML = styles.map((src, index) => `
            <div class="gallery-item">
                <img src="${src}" onclick="window.open('${src}', '_blank')">
                <button class="del-img-btn" onclick="deleteStyle(${index})">&times;</button>
            </div>
        `).join('');
    }

    imageUpload.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => saveStyle(event.target.result);
        reader.readAsDataURL(e.target.files[0]);
    };

    pinBtn.onclick = () => {
        const url = prompt("Paste Pinterest Image Link:");
        if (url) saveStyle(url);
    };

    function saveStyle(src) {
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        styles.unshift(src);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        renderGallery();
    }

    window.deleteStyle = (index) => {
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY));
        styles.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        renderGallery();
    };

    // --- AI CHAT LOGIC (Vercel Proxy) ---
    const chatBtn = document.getElementById('aiChatBtn');
    const chatWindow = document.getElementById('aiChatWindow');
    const sendBtn = document.getElementById('sendAiBtn');
    const aiInput = document.getElementById('aiInput');
    const chatMessages = document.getElementById('chatMessages');
    
    let chatHistory = [{ role: "system", content: "You are Meazura AI, a tailoring expert." }];

    window.toggleAiChat = () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    };

    chatBtn.onclick = toggleAiChat;

    sendBtn.onclick = async () => {
        const text = aiInput.value.trim();
        if(!text) return;

        appendMessage('user', text);
        aiInput.value = '';
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...chatHistory, {role: "user", content: text}] })
            });
            const data = await response.json();
            appendMessage('bot', data.output);
            chatHistory.push({role: "user", content: text}, {role: "assistant", content: data.output});
        } catch (err) {
            appendMessage('bot', "Connection error. Try again later.");
        }
    };

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        div.innerText = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});