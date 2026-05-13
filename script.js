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
    







