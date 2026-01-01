let currentData = {};
let currentTab = 'profile';

// --- Login ---
function checkPassword() {
    const input = document.getElementById('password-input').value;
    // Simple client-side password for demonstration
    if (input === 'admin123') {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('flex');
        loadData();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

// --- Data Management ---
async function loadData() {
    try {
        const response = await fetch('./data/data.json');
        currentData = await response.json();
        switchTab('profile');
    } catch (error) {
        alert('Error loading data. Make sure you are running this on a server (or VS Code Live Server).');
        console.error(error);
    }
}

function saveData() {
    // Update currentData from forms before saving (in case of blur issues)
    // Actually, we update on input, so currentData should be fresh.
}

function downloadData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- Tabs ---
function switchTab(tab) {
    currentTab = tab;
    
    // Update UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-white/10', 'text-gold-500');
        if (btn.dataset.tab === tab) {
            btn.classList.add('bg-white/10', 'text-gold-500');
        }
    });

    renderForm();
    renderPreview();
}

// --- Form Rendering ---
function renderForm() {
    const container = document.getElementById('form-container');
    container.innerHTML = '';

    if (currentTab === 'profile') {
        createInput(container, 'الاسم', currentData.profile.name, (v) => currentData.profile.name = v);
        createInput(container, 'المسمى الوظيفي', currentData.profile.title, (v) => currentData.profile.title = v);
        createTextarea(container, 'نبذة قصيرة', currentData.profile.bio_short, (v) => currentData.profile.bio_short = v);
        createTextarea(container, 'نبذة كاملة', currentData.profile.bio_full, (v) => currentData.profile.bio_full = v);
        createInput(container, 'رابط صورة الغلاف', currentData.profile.hero_image, (v) => currentData.profile.hero_image = v);
        createInput(container, 'نص الشعار', currentData.profile.logo_text, (v) => currentData.profile.logo_text = v);
    } 
    else if (currentTab === 'socials') {
        Object.keys(currentData.socials).forEach(key => {
            createInput(container, key, currentData.socials[key], (v) => currentData.socials[key] = v);
        });
    }
    else if (currentTab === 'programs') {
        renderListForm(container, currentData.programs, createProgramInputs);
    }
    else if (currentTab === 'videos') {
        renderListForm(container, currentData.videos, createVideoInputs);
    }
    else if (currentTab === 'gallery') {
        renderListForm(container, currentData.gallery, createGalleryInput, true); // true for simple array
    }
}

// --- Helper: Input Creators ---
function createInput(parent, label, value, onChange) {
    const div = document.createElement('div');
    div.className = 'mb-4';
    div.innerHTML = `<label class="block text-sm font-bold mb-2 text-gray-700">${label}</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'w-full p-2 border rounded focus:border-gold-500 outline-none';
    input.value = value || '';
    input.oninput = (e) => {
        onChange(e.target.value);
        renderPreview();
    };
    div.appendChild(input);
    parent.appendChild(div);
}

function createTextarea(parent, label, value, onChange) {
    const div = document.createElement('div');
    div.className = 'mb-4';
    div.innerHTML = `<label class="block text-sm font-bold mb-2 text-gray-700">${label}</label>`;
    const input = document.createElement('textarea');
    input.className = 'w-full p-2 border rounded focus:border-gold-500 outline-none h-24';
    input.value = value || '';
    input.oninput = (e) => {
        onChange(e.target.value);
        renderPreview();
    };
    div.appendChild(input);
    parent.appendChild(div);
}

function renderListForm(parent, list, itemCreator, isSimpleArray = false) {
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-6';
    
    list.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 border border-gray-300 rounded bg-gray-50 relative';
        
        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.className = 'absolute top-2 left-2 text-red-500 hover:text-red-700 font-bold';
        delBtn.innerText = 'حذف';
        delBtn.onclick = () => {
            list.splice(index, 1);
            renderForm();
            renderPreview();
        };
        itemDiv.appendChild(delBtn);

        itemCreator(itemDiv, item, index, list);
        listContainer.appendChild(itemDiv);
    });

    parent.appendChild(listContainer);

    // Add New Button
    const addBtn = document.createElement('button');
    addBtn.className = 'mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
    addBtn.innerText = 'إضافة عنصر جديد';
    addBtn.onclick = () => {
        if (isSimpleArray) list.push("https://placehold.co/400");
        else if (currentTab === 'programs') list.push({ title: "New Program", description: "", channel: "", image: "" });
        else if (currentTab === 'videos') list.push({ title: "New Video", url: "", thumbnail: "" });
        
        renderForm();
        renderPreview();
    };
    parent.appendChild(addBtn);
}

function createProgramInputs(parent, item, index, list) {
    createInput(parent, 'العنوان', item.title, (v) => item.title = v);
    createInput(parent, 'القناة', item.channel, (v) => item.channel = v);
    createInput(parent, 'الصورة', item.image, (v) => item.image = v);
    createTextarea(parent, 'الوصف', item.description, (v) => item.description = v);
}

function createVideoInputs(parent, item, index, list) {
    createInput(parent, 'العنوان', item.title, (v) => item.title = v);
    createInput(parent, 'رابط الفيديو', item.url, (v) => item.url = v);
    createInput(parent, 'صورة مصغرة', item.thumbnail, (v) => item.thumbnail = v);
}

function createGalleryInput(parent, item, index, list) {
    createInput(parent, 'رابط الصورة', item, (v) => list[index] = v);
    const imgPreview = document.createElement('img');
    imgPreview.src = item;
    imgPreview.className = 'w-20 h-20 object-cover mt-2 rounded';
    parent.appendChild(imgPreview);
}

// --- Preview Rendering ---
function renderPreview() {
    const container = document.getElementById('preview-container');
    container.innerHTML = '';

    if (currentTab === 'profile') {
        container.innerHTML = `
            <div class="bg-royal-900 text-white p-6 rounded text-center">
                <h1 class="text-2xl font-bold text-gold-500">${currentData.profile.name}</h1>
                <h2 class="text-lg text-gray-300">${currentData.profile.title}</h2>
                <img src="${currentData.profile.hero_image}" class="w-32 h-32 rounded-full mx-auto my-4 border-2 border-gold-500 object-cover">
                <p class="text-sm">${currentData.profile.bio_short}</p>
            </div>
            <div class="mt-4 p-4 bg-white text-black rounded shadow">
                <h3 class="font-bold mb-2">نبذة كاملة:</h3>
                <p>${currentData.profile.bio_full}</p>
            </div>
        `;
    }
    else if (currentTab === 'socials') {
        container.innerHTML = `<div class="flex flex-col space-y-2 p-4">
            ${Object.entries(currentData.socials).map(([k, v]) => `
                <a href="${v}" class="text-blue-600 hover:underline flex items-center gap-2">
                    <span class="font-bold capitalize">${k}:</span> ${v}
                </a>
            `).join('')}
        </div>`;
    }
    else if (currentTab === 'programs') {
        container.innerHTML = `<div class="grid grid-cols-1 gap-4">
            ${currentData.programs.map(p => `
                <div class="bg-royal-900 text-white rounded overflow-hidden shadow">
                    <img src="${p.image}" class="w-full h-32 object-cover">
                    <div class="p-4">
                        <span class="text-gold-500 text-xs">${p.channel}</span>
                        <h3 class="font-bold">${p.title}</h3>
                        <p class="text-xs text-gray-400">${p.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>`;
    }
    else if (currentTab === 'videos') {
        container.innerHTML = `<div class="grid grid-cols-1 gap-4">
            ${currentData.videos.map(v => `
                <div class="bg-black text-white rounded overflow-hidden shadow">
                    <div class="aspect-w-16 aspect-h-9 bg-gray-800 flex items-center justify-center">
                        <span class="text-xs text-gray-500">Video Embed: ${v.url}</span>
                    </div>
                    <div class="p-2">
                        <h3 class="font-bold text-sm">${v.title}</h3>
                    </div>
                </div>
            `).join('')}
        </div>`;
    }
    else if (currentTab === 'gallery') {
        container.innerHTML = `<div class="grid grid-cols-2 gap-2">
            ${currentData.gallery.map(img => `
                <img src="${img}" class="w-full h-32 object-cover rounded">
            `).join('')}
        </div>`;
    }
}