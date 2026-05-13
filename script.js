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

