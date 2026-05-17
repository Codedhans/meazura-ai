/**
 * Meazura Men's Logic
 * Isolated logic for Men's measurements
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'meazura_men_records';
    let editId = null;

    // DOM Elements
    const drawer = document.getElementById('menDrawer');
    const overlay = document.getElementById('overlay');
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const menForm = document.getElementById('menForm');
    const recordsContainer = document.getElementById('menRecordsContainer');
    const themeToggle = document.getElementById('themeToggle');

    // --- UI Controls ---
    const toggleDrawer = (show) => {
        drawer.classList.toggle('active', show);
        overlay.classList.toggle('active', show);
        if (!show) {
            menForm.reset();
            editId = null;
        }
    };

    openBtn.onclick = () => toggleDrawer(true);
    closeBtn.onclick = () => toggleDrawer(false);
    overlay.onclick = () => toggleDrawer(false);

    themeToggle.onclick = () => {
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    };

    // --- Data Handlers ---
    const getRecords = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    const saveRecords = (records) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        renderRecords();
    };

    menForm.onsubmit = (e) => {
        e.preventDefault();
        const clientName = document.getElementById('clientName').value;
        const measurements = {};
        
        // Loop through all number inputs
        menForm.querySelectorAll('input[type="number"]').forEach(input => {
            measurements[input.id] = input.value || "0";
        });

        let records = getRecords();
        if (editId) {
            records = records.map(r => r.id === editId ? { ...r, name: clientName, data: measurements } : r);
        } else {
            records.push({
                id: Date.now(),
                name: clientName,
                data: measurements,
                date: new Date().toLocaleDateString()
            });
        }

        saveRecords(records);
        toggleDrawer(false);
        document.getElementById('successModal').classList.add('active');
    };

    const renderRecords = () => {
        const records = getRecords();
        recordsContainer.innerHTML = records.length ? "" : '<p style="text-align:center; color:gray; margin-top:40px;">No saved measurements.</p>';

        records.forEach(record => {
            const card = document.createElement('div');
            card.className = 'client-card';
            
            let tableHTML = "";
            for (let key in record.data) {
                // Formatting key names for display
                const label = key.replace(/([A-Z])/g, ' $1').trim();
                tableHTML += `<div class="m-row"><span>${label}</span><span>${record.data[key]}</span></div>`;
            }

            card.innerHTML = `
                <div class="card-header" onclick="this.nextElementSibling.classList.toggle('active')">
                    <span>${record.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="card-body">
                    ${tableHTML}
                    <div class="card-actions">
                        <button class="act-btn btn-wa" onclick="notifyClient('${record.name}')"><i class="fab fa-whatsapp"></i> Notify</button>
                        <button class="act-btn btn-edit" onclick="editRecord(${record.id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="act-btn btn-del" onclick="deleteRecord(${record.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            recordsContainer.appendChild(card);
        });
    };

    // --- Global Action Functions (Attached to window for HTML access) ---
    window.notifyClient = (name) => {
        const msg = encodeURIComponent(`Hello ${name}, this is Meazura. Your outfit is ready for fitting!`);
        window.open(`https://wa.me/?text=${msg}`);
    };

    window.deleteRecord = (id) => {
        if (confirm("Delete this record permanently?")) {
            const records = getRecords().filter(r => r.id !== id);
            saveRecords(records);
        }
    };

    window.editRecord = (id) => {
        const record = getRecords().find(r => r.id === id);
        if (record) {
            editId = id;
            document.getElementById('clientName').value = record.name;
            for (let key in record.data) {
                const field = document.getElementById(key);
                if (field) field.value = record.data[key];
            }
            toggleDrawer(true);
        }
    };

    renderRecords();
});


//LOGIC FOR RENDER GALLERY 
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELECTORS ---
    const galleryOverlay = document.getElementById('galleryOverlay');
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    const closeGalleryBtn = document.querySelector('.close-gallery-btn');
    const imageUpload = document.getElementById('imageUpload');
    const galleryGrid = document.getElementById('galleryGrid');

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

//OPEN CHATBOT

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



    const aiChatWindow = document.getElementById('aiChatWindow');
    const aiChatBtn = document.getElementById('aiChatBtn'); // The button to open AI
    const closeAiBtn = document.getElementById('closeAiBtn');

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
    

// ===== AI CHATBOT FUNCTION FOR TAILORING BUSINESS =====

/**
 * Tailoring Business AI Assistant
 * Provides insights on fabric types, measurements, styles, and tailoring best practices
 */
window.TailoringAI = {
    // Knowledge base for tailoring business
    knowledgeBase: {
        fabrics: {
            cotton: "Cotton is breathable and comfortable. Best for casual shirts and daily wear. Prone to wrinkles, requires regular ironing.",
            silk: "Silk is luxurious and smooth. Perfect for formal wear and evening attire. Delicate, requires dry cleaning.",
            wool: "Wool is warm and durable. Ideal for suits and winter wear. Shrinks if not cared for properly.",
            linen: "Linen is cool and breathable. Great for summer wear. Wrinkles easily but gives a relaxed look.",
            polyester: "Polyester is durable and wrinkle-resistant. Often blended with natural fibers. Good for affordable options.",
            "cotton-blend": "Blends combine the best of both fabrics. Easier to care for than pure natural fibers. Most popular choice."
        },
        styles: {
            formal: "Formal wear requires clean lines, fitted silhouettes, and quality fabrics. Focus on chest, waist, and length measurements.",
            casual: "Casual wear should be comfortable and relaxed. Slightly looser fit. Consider arm and shoulder measurements.",
            business: "Business attire needs a professional look with good fit. Standard sizing based on chest and waist.",
            traditional: "Traditional wear varies by culture. Requires specific measurements based on the garment style."
        },
        measurements: {
            chest: "Measure at the fullest part of the chest. Client should wear an undershirt. Critical for proper fit.",
            waist: "Measure at the natural waist level. Should be snug but not tight. Important for trouser and shirt fit.",
            neck: "Measure around the base of the neck. For shirts, add 0.5 inches for comfort. Must be accurate.",
            sleeve: "Measure from the center of the back to the wrist with arm slightly bent. Critical for shirt length.",
            shoulder: "Measure from shoulder bone to shoulder bone across the back. Should match the client's natural width.",
            length: "Shirt length typically hits mid-thip. Trouser breaks at shoe top.",
            bicep: "Measure around the fullest part of the arm when relaxed. Important for sleeve fit."
        },
        tips: {
            fitting: "Always have the client try on a similar garment before cutting. Take measurements with them standing straight. Use a flexible tape measure.",
            production: "Mark all alterations clearly. Double-check measurements before cutting. Keep client communication throughout.",
            pricing: "Factor in fabric cost, labor, and overhead. Premium fabrics cost more. Complex designs require more time.",
            client_management: "Always keep detailed records. Take photos of finished work. Send progress updates to clients."
        }
    },

    // Core AI function to process user queries
    processQuery: function(userMessage) {
        const message = userMessage.toLowerCase().trim();
        let response = this.findBestMatch(message);
        
        if (!response) {
            response = this.generateContextualResponse(message);
        }
        
        return response || "I'm not sure about that. Ask me about fabrics, measurements, styles, fitting tips, or tailoring business advice!";
    },

    // Find exact or partial matches in knowledge base
    findBestMatch: function(query) {
        const keywords = query.split(' ');
        
        // Check fabrics
        for (const [fabric, info] of Object.entries(this.knowledgeBase.fabrics)) {
            if (keywords.includes(fabric)) {
                return `${fabric.toUpperCase()}: ${info}`;
            }
        }
        
        // Check styles
        for (const [style, info] of Object.entries(this.knowledgeBase.styles)) {
            if (keywords.includes(style)) {
                return `${style.toUpperCase()} WEAR: ${info}`;
            }
        }
        
        // Check measurements
        for (const [measure, info] of Object.entries(this.knowledgeBase.measurements)) {
            if (keywords.includes(measure)) {
                return `${measure.toUpperCase()} MEASUREMENT: ${info}`;
            }
        }
        
        // Check tips
        for (const [tip, info] of Object.entries(this.knowledgeBase.tips)) {
            if (keywords.includes(tip)) {
                return `${tip.toUpperCase()} TIPS: ${info}`;
            }
        }
        
        return null;
    },

    // Generate contextual responses for complex queries
    generateContextualResponse: function(query) {
        const responses = {
            recommendation: [
                "Based on measurements, ensure chest and waist are measured accurately. Then select a fabric that suits the client's needs and budget.",
                "For a perfect fit, I recommend getting accurate shoulder, chest, waist, and length measurements before any work begins.",
                "Choose fabric based on occasion: Cotton for casual, Wool for formal, and Silk for premium formal wear."
            ],
            fit: [
                "A good fit means the garment sits comfortably without being too tight. Chest should have about 2 inches ease, waist 1 inch.",
                "Check if sleeve length reaches the wrist naturally, shoulder seams align with actual shoulders, and the hem breaks properly at the shoe.",
                "Always ask the client how it feels. Comfort is key for a successful tailoring job."
            ],
            pricing: [
                "Calculate based on fabric cost (wholesale), labor time (hourly rate), and overhead. Add 40-60% markup for profit.",
                "Simple alterations: $10-30. Basic tailoring: $50-150. Premium custom work: $200+. Depends on location and expertise.",
                "Consider client budget and provide options. Sometimes fabric upgrades are worth the extra cost."
            ],
            care: [
                "Cotton: Wash warm, dry medium. Silk: Dry clean only. Wool: Dry clean or hand wash gently. Always ask clients about care.",
                "Provide care instructions with every garment. Quality fabrics deserve proper maintenance for longevity."
            ]
        };
        
        if (query.includes('recommend') || query.includes('suggest') || query.includes('should')) {
            return this.getRandomResponse(responses.recommendation);
        }
        if (query.includes('fit') || query.includes('comfortable') || query.includes('perfect')) {
            return this.getRandomResponse(responses.fit);
        }
        if (query.includes('price') || query.includes('cost') || query.includes('charge')) {
            return this.getRandomResponse(responses.pricing);
        }
        if (query.includes('care') || query.includes('wash') || query.includes('clean')) {
            return this.getRandomResponse(responses.care);
        }
        
        return null;
    },

    // Get random response from array
    getRandomResponse: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Get all available topics
    getTopics: function() {
        const topics = [
            "Fabrics: " + Object.keys(this.knowledgeBase.fabrics).join(", "),
            "Styles: " + Object.keys(this.knowledgeBase.styles).join(", "),
            "Measurements: " + Object.keys(this.knowledgeBase.measurements).join(", "),
            "Tips: " + Object.keys(this.knowledgeBase.tips).join(", ")
        ];
        return topics.join("\n");
    }
};

// AI Chat UI Handler
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const aiInput = document.getElementById('aiInput');
    const sendAiBtn = document.getElementById('sendAiBtn');

    if (!sendAiBtn || !aiInput) return;

    // Send message function
    window.sendAiMessage = function() {
        const userText = aiInput.value.trim();
        if (!userText) return;

        // Display user message
        const userMsg = document.createElement('div');
        userMsg.className = 'msg user';
        userMsg.textContent = userText;
        chatMessages.appendChild(userMsg);

        // Get AI response
        const aiResponse = TailoringAI.processQuery(userText);
        
        // Display AI response with slight delay
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = 'msg bot';
            botMsg.textContent = aiResponse;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 300);

        // Clear input
        aiInput.value = '';
        aiInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Send on button click
    sendAiBtn.onclick = window.sendAiMessage;

    // Send on Enter key
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.sendAiMessage();
        }
    });
});
