// --- GLOBAL AI CHAT FUNCTIONS ---

window.toggleAiChat = function() {
    const chatWindow = document.getElementById('aiChatWindow');
    if (!chatWindow) return;
    
    const isHidden = chatWindow.style.display === 'none' || !chatWindow.style.display;
    chatWindow.style.display = isHidden ? 'flex' : 'none';
    
    // Focus input if opening
    if (isHidden) {
        const input = document.getElementById('aiInput');
        if (input) input.focus();
    }
};

window.closeAiChat = function() {
    const chatWindow = document.getElementById('aiChatWindow');
    if (chatWindow) {
        chatWindow.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELECTORS ---
    const galleryOverlay = document.getElementById('galleryOverlay');
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    const closeGalleryBtn = document.querySelector('.close-gallery-btn');

    const aiChatWindow = document.getElementById('aiChatWindow');
    const aiChatBtn = document.getElementById('aiChatBtn'); // The button to open AI
    const closeAiBtn = document.getElementById('closeAiBtn');

    const imageUpload = document.getElementById('imageUpload');
    const galleryGrid = document.getElementById('galleryGrid');
 // --- PLACE THIS INSIDE YOUR DOMContentLoaded BLOCK ---

const sendAiBtn = document.getElementById('sendAiBtn');
const aiInput = document.getElementById('aiInput');

if (sendAiBtn) {
    sendAiBtn.onclick = async () => {
        const query = aiInput.value.trim();
        if (!query) return;

        // 1. Display User Message & Clear Input
        appendMessage('user', query);
        aiInput.value = '';
        conversationHistory.push({ role: "user", content: query });

        // 2. Show Typing Indicator
        const typingId = 'typing-' + Date.now();
        showTyping(typingId);

        try {
            // 3. Vercel API Call (Secure)
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationHistory })
            });

            const data = await response.json();
            document.getElementById(typingId)?.remove();

            // 4. Handle Response
            if (data.output) {
                appendMessage('bot', data.output);
                conversationHistory.push({ role: "assistant", content: data.output });
            } else {
                appendMessage('bot', "I couldn't get a response. Please try again.");
            }
        } catch (err) {
            document.getElementById(typingId)?.remove();
            appendMessage('bot', "Connection lost. Check your Vercel deployment.");
            console.error("Vercel Chat Error:", err);
        }
    };
}

// Optional: Also allow sending with the 'Enter' key
if (aiInput) {
    aiInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendAiBtn.click();
    };
}

    const STORAGE_KEY = 'meazura_gallery_styles';

    // --- 2. WINDOW TOGGLE LOGIC (.onclick) ---

    // Gallery Window
    if (openGalleryBtn) {
        openGalleryBtn.onclick = () => {
            galleryOverlay.style.display = 'flex';
            galleryOverlay.classList.add('active');
            renderGallery();
        };
    }

    if (closeGalleryBtn) {
        closeGalleryBtn.onclick = () => {
            galleryOverlay.style.display = 'none';
            galleryOverlay.classList.remove('active');
        };
    }

    // AI Chat Window
    if (aiChatBtn) {
        aiChatBtn.onclick = () => {
            const isHidden = aiChatWindow.style.display === 'none' || !aiChatWindow.style.display;
            aiChatWindow.style.display = isHidden ? 'flex' : 'none';
        };
    }

    if (closeAiBtn) {
        closeAiBtn.onclick = () => {
            aiChatWindow.style.display = 'none';
        };
    }

    // --- 3. IMAGE UPLOAD & SAVE LOGIC ---
  // --- OPTIMIZED IMAGE SAVE LOGIC ---

if (imageUpload) {
    imageUpload.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // Create a canvas to compress the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set max dimensions (e.g., 800px) to save space
                const maxWidth = 800;
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to compressed JPEG (0.7 quality)
                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                saveToGallery(compressedData);
            };
        };
        reader.readAsDataURL(file);
    };
}

function saveToGallery(data) {
    let styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Add new image to the beginning
    styles.unshift(data); 
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        console.log("Image saved successfully. Total items:", styles.length);
        renderGallery();
    } catch (error) {
        // If it finally hits the hard 5MB limit, we'll notify you
        console.error("Browser Storage Limit Reached:", error);
        alert("The browser's storage is completely full. You may need to delete older styles to add more.");
    }
}
/*
    if (imageUpload) {
        imageUpload.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const imgData = event.target.result;
                saveToGallery(imgData);
            };
            reader.readAsDataURL(file);
        };
    }

    function saveToGallery(data) {
        try {
            let styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            styles.unshift(data); // Add new image to the start
            localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
            renderGallery();
        } catch (error) {
            alert("Storage full! Please delete some old styles to add new ones.");
            console.error("Storage Error:", error);
        }
    }
*/
    // --- 4. RENDER & PREVIEW LOGIC ---

    function renderGallery() {
        if (!galleryGrid) return;
        const styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        galleryGrid.innerHTML = styles.map((src, index) => `
            <div class="gallery-item">
                <img src="${src}" class="preview-trigger" data-index="${index}">
                <button class="del-btn" data-index="${index}">&times;</button>
            </div>
        `).join('');

        // Attach clicks for Preview (Lightbox)
        document.querySelectorAll('.preview-trigger').forEach(img => {
            img.onclick = () => openLightbox(img.src);
        });

        // Attach clicks for Delete
        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                deleteStyle(btn.getAttribute('data-index'));
            };
        });
    }

    function deleteStyle(index) {
        let styles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        styles.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        renderGallery();
    }

    function openLightbox(src) {
        const lb = document.createElement('div');
        lb.className = 'lightbox-overlay';
        lb.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; cursor:pointer;";
        lb.innerHTML = `<img src="${src}" style="max-width:90%; max-height:80%; border-radius:10px; border:2px solid #DAA520;">`;
        
        lb.onclick = () => lb.remove();
        document.body.appendChild(lb);
    }
});


window.openGallery = function() {
    const overlay = document.getElementById('galleryOverlay');
    if (overlay) {
        overlay.style.display = 'flex'; // Must be flex!
        overlay.classList.add('active');
        
        // Refresh the images
        if (window.renderGallery) window.renderGallery();
        
        // This ensures the grid starts at the top every time you open it
        const grid = document.getElementById('galleryGrid');
        if (grid) grid.scrollTop = 0;
    }
};











