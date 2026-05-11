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




// --- Chat UI Controller ---
const chatMessages = document.getElementById('chatMessages');
const aiInput = document.getElementById('aiInput');
const sendBtn = document.getElementById('sendAiBtn');

async function handleChat() {
    const text = aiInput.value.trim();
    if (!text) return;

    // Append User Message
    appendMessage('user', text);
    aiInput.value = '';

    // Show Typing Indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg bot';
    typingDiv.id = typingId;
    typingDiv.innerHTML = '<i class="fas fa-ellipsis-h fa-beat"></i>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const result = await askGroq(text);

    // Remove Typing and Add AI Message
    document.getElementById(typingId).remove();
    appendMessage('bot', result);
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    // Simple Markdown-style replacement for line breaks and bolding
    div.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Listeners
sendBtn.addEventListener('click', handleChat);
aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });





// --- AI Chat Logic ---
function toggleAiChat() {
    const window = document.getElementById('aiChatWindow');
    window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
}

document.getElementById('aiChatBtn').onclick = toggleAiChat;

document.getElementById('sendAiBtn').onclick = async () => {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';

    const aiResponse = await askGroq(msg);
    appendMessage('bot', aiResponse);
};

function appendMessage(role, text) {
    const chat = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}


document.addEventListener('DOMContentLoaded', () => {
    const galleryOverlay = document.getElementById('galleryOverlay');
    const openBtn = document.getElementById('openGalleryBtn');
    const closeBtn = document.getElementById('closeGallery');
    const galleryGrid = document.getElementById('galleryGrid');
    const uploadInput = document.getElementById('imageUpload');
    const pinBtn = document.getElementById('pinBtn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    const STORAGE_KEY = 'meazura_gallery_styles';

    
    



const infoOverlay = document.getElementById('infoOverlay');
const infoTitle = document.getElementById('infoTitle');
const infoContent = document.getElementById('infoContent');

function showInfo(type) {
    infoOverlay.classList.add('active');
    
    if (type === 'about') {
        infoTitle.innerText = "About Codedhans";
        infoContent.innerHTML = `
            <div class="about-dev">
                <img src="images/mypic.png" class="dev-photo" alt="Hanson - Developer">
                <h3>Hanson (codedhans)</h3>
                <strong>Meazura</strong> is a modern, professional web application designed specifically for tailors, designers, and custom clothiers. We eliminate the need for paper records, providing a secure, efficient platform to **store, organize, and manage client body measurements** digitally.</p>
            
            <p>Our focus is on <b>data privacy</b> and <b>simplicity</b>, ensuring you can concentrate on your craft while we handle the data security and organization.</p>
    <h3>Crafted by CodedHans</h3>
            <p>Meazura is proudly developed and maintained by <b>CodedHans</b>, a software solutions venture specializing in elegant, focused tools for creative professionals and niche industries.</p>
            
            <p>We build technologies that simplify complex tasks, and Meazura is a prime example of our commitment to <b>practical, secure, and user-first development</b>.</p>
            
     <p>App Version: 1.0.1</p>
            <p>&copy; 2025 CodedHans. All rights reserved.</p>
            </div>
            <div class="app-guide">
                <h4>Quick Guide</h4>
                <ul>
                    <li><strong>Measurements:</strong> Tap "Add New" to record client metrics. They are saved locally to your device.</li>
                    <li><strong>AI Assistant:</strong> Use the robot icon to ask for fabric yardage or style advice.</li>
                    <li><strong>Gallery:</strong> Save inspiration from Pinterest or your camera roll to show clients.</li>
                    <li><strong>Notify:</strong> Use the WhatsApp button on cards to instantly update clients.</li>
                </ul>
            </div>
        `;
    }
}

function contactUs() {
    infoOverlay.classList.add('active');
    infoTitle.innerText = "Connect with Me";
    infoContent.innerHTML = `
        <div class="contact-links">
            <a href="https:x.com/codedhans" class="social-link"><i class="fab fa-twitter"></i> Twitter</a>
<a href="https:codedhans.github.io" class="social-link"><i class="fab fa-github"></i> GitHub</a>
<a href="https:wa.me/+2347065383220" class="social-link"><i class="fab fa-whatsapp"></i> WhatsApp</a>
            <a href="https:www.instagram.com/codedhans" class="social-link"><i class="fab fa-instagram"></i> Instagram</a>
            <a href="mailto: codedspace1@gmail.com" class="social-link"><i class="fas fa-envelope"></i> Email</a>
        </div>
        <div class="brand-footer">
            <img src="images/codedhanslogo.png" style="width:100px; height:100px; border-radius: 50%; object-fit: cover;" alt="Codedhans Logo">
            
            <img src="images/logo.png" style="width:100px; height:100px; border-radius: 50%; object-fit: contain;" alt="Meazura Logo">
        </div>
    `;
}

function policyP() {
    infoOverlay.classList.add('active');
    infoTitle.innerText = "Privacy Policy";
    infoContent.innerHTML = `        <h2 class="policy-title">Meazura Privacy Policy</h2>
        <p class="policy-date"><strong>Effective Date:</strong> October 10, 2025</p>

        <p>This Privacy Policy describes how **CodedHans**, the developer and operator of the Meazura application ("the App," "we," "us," or "our"), collects, uses, and protects the limited information of our users and their clients. We are committed to maintaining the privacy and security of the professional data stored within the App.</p>

        <h3>1. Information We Collect</h3>
        <p>We only collect information necessary to provide and maintain the core function of the Meazura application.</p>

        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Type of Data Collected</th>
                        <th>Purpose for Collection</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>User-Entered Client Data (PII)</strong></td>
                        <td>Client Names, Client Body Measurements.</td>
                        <td>To provide the core service of the App: allowing the user (tailor/designer) to store, organize, and manage measurement profiles for their clients.</td>
                    </tr>
                    <tr>
                        <td><strong>Technical Data</strong></td>
                        <td>IP addresses, browser information, theme preference.</td>
                        <td><strong>IP Address:</strong> For security and aggregated traffic analysis by the hosting provider. <strong>Theme Preference:</strong> Saved locally in your browser's Local Storage to remember your display setting.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3>2. How We Use Your Data</h3>
        <ul class="policy-list">
            <li><strong>To Provide the Service:</strong> The client names and measurements are used entirely within your account. We do not analyze, sell, or share this client-specific data.</li>
            <li><strong>To Maintain the App:</strong> Technical data is used to diagnose issues and ensure basic functionality.</li>
        </ul>

        <h3>3. Data Storage and Security</h3>
        <ul class="policy-list">
            <li><strong>Storage Location:</strong> All client data you enter is stored securely on the hosting server/cloud provider utilized by Meazura.</li>
            <li><strong>Data Retention:</strong> Client data is retained for as long as your account is active. Deleted data is permanently removed.</li>
        </ul>
        
        <h3>4. Sharing of Information</h3>
        <p>We do not sell or rent any personal data. Data is only shared with third-party hosting services necessary to operate the App, or if legally required to do so by governmental bodies or court orders.</p>
        
        <h3>5. Your Data Rights</h3>
        <p>You can view, edit, and delete all client data stored in your account at any time through the App interface.</p>

        <h3>6. Contact Us Regarding Privacy (Updated for Social Media)</h3>
        <p>For questions or concerns about this Privacy Policy, your data rights, or the Meazura application, please contact the data controller, **CodedHans**, using the following methods:</p>`;
}

function termsCon() {
    infoOverlay.classList.add('active');
    infoTitle.innerText = "Terms & Conditions";
    infoContent.innerHTML = `<h2 class="policy-title">Meazura Terms & Conditions ("T&C")</h2>
        <p class="policy-date"><strong>Effective Date:</strong> October 10, 2025</p>

        <p>Please read these Terms & Conditions ("Terms") carefully before using the Meazura web application (the "Service"). The Service is operated by **CodedHans** ("us," "we," or "our") which owns and operates the Meazura application.</p>

        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.</p>

        <h3>2. Service Overview</h3>
        <p>Meazura is a professional tool designed to facilitate the digital storage and organization of client-specific body measurements and associated identifying information (Client Names) for tailors, designers, and related professionals.</p>

        <h3>3. User Responsibilities</h3>
        <ul class="policy-list">
            <li><strong>Account Security:</strong> You are responsible for safeguarding your password and for all activities that occur under your account.</li>
            <li><strong>Accuracy of Data:</strong> You are solely responsible for the accuracy, legality, and appropriateness of the Client Data that you input.</li>
            <li><strong>Lawful Use:</strong> You agree to use the App only for lawful, professional purposes.</li>
        </ul>

        <h3>4. Intellectual Property</h3>
        <p>The Service content, features, and functionality are the exclusive property of **CodedHans**. You retain all rights to the Client Data (Names and Measurements) you enter, granting CodedHans a limited license to use this data solely for the purpose of providing the Service to you. The trademarks "Meazura" and "**CodedHans**" are the property of CodedHans.</p>

        <h3>5. Limitation of Liability and Disclaimer</h3>
        <p>In no event shall CodedHans or its affiliates be liable for any indirect damages, including loss of profits or data, resulting from the use of the Service. Your use of the Service is at your sole risk. The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis.</p>

        <h3>6. Governing Law and Changes</h3>
        <p>These Terms shall be governed and construed in accordance with the laws of **Nigeria**. We reserve the right to modify or replace these Terms at any time.</p>`;
}

function closeInfo() {
    infoOverlay.classList.remove('active');
}





