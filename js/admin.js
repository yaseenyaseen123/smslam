let currentData = {};
let currentTab = 'profile';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyD0ca9eOjegERUeIrSJhMPWHLr8DTX34nM",
    authDomain: "salam-portfolio-1f9da.firebaseapp.com",
    databaseURL: "https://salam-portfolio-1f9da-default-rtdb.firebaseio.com",
    projectId: "salam-portfolio-1f9da",
    storageBucket: "salam-portfolio-1f9da.firebasestorage.app",
    messagingSenderId: "548613835942",
    appId: "1:548613835942:web:173452ab65d315067b3867",
    measurementId: "G-G0L6D4P87X"
};

// --- Login ---
function checkPassword() {
    const input = document.getElementById('password-input').value;
    // Simple client-side password for demonstration
    if (input === 'admin123') {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('flex');
        loadData();
        initFirebaseAdmin(); // Init Firebase
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
}

// --- Firebase Admin Logic ---
let db;
function initFirebaseAdmin() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
    } catch (error) {
        console.error("Firebase Init Error:", error);
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

// --- GitHub API Integration ---
let ghConfig = {
    token: localStorage.getItem('gh_token') || '',
    owner: localStorage.getItem('gh_owner') || 'yaseenyaseen123',
    repo: localStorage.getItem('gh_repo') || 'smslam'
};

function openGitHubSettings() {
    document.getElementById('github-modal').classList.remove('hidden');
    document.getElementById('gh-token').value = ghConfig.token;
    document.getElementById('gh-owner').value = ghConfig.owner;
    document.getElementById('gh-repo').value = ghConfig.repo;
}

function saveGitHubSettings() {
    const token = document.getElementById('gh-token').value;
    const owner = document.getElementById('gh-owner').value;
    const repo = document.getElementById('gh-repo').value;

    if (!token) {
        alert('الرجاء إدخال Token');
        return;
    }

    ghConfig = { token, owner, repo };
    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_owner', owner);
    localStorage.setItem('gh_repo', repo);
    
    document.getElementById('github-modal').classList.add('hidden');
    alert('تم حفظ الإعدادات بنجاح');
}

async function saveToGitHub() {
    if (!ghConfig.token) {
        openGitHubSettings();
        return;
    }

    const confirmSave = confirm("هل أنت متأكد من نشر التعديلات للموقع؟ سيتم تحديث الموقع خلال دقائق.");
    if (!confirmSave) return;

    const path = 'data/data.json';
    const content = JSON.stringify(currentData, null, 2);
    const message = 'update: Update site content via Admin Panel';

    try {
        // 1. Get current SHA
        const getUrl = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${path}`;
        const getRes = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getRes.ok) throw new Error('Failed to fetch file info');
        const fileData = await getRes.json();
        const sha = fileData.sha;

        // 2. Update file
        const putRes = await fetch(getUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                content: btoa(unescape(encodeURIComponent(content))), // Handle UTF-8
                sha: sha
            })
        });

        if (putRes.ok) {
            alert('تم الحفظ والنشر بنجاح! 🚀\nانتظر دقيقة أو دقيقتين ثم حدث الموقع.');
        } else {
            const err = await putRes.json();
            throw new Error(err.message);
        }

    } catch (error) {
        console.error(error);
        alert('حدث خطأ أثناء الحفظ: ' + error.message);
    }
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
        
        // Enhanced Image Input
        const imgContainer = document.createElement('div');
        imgContainer.className = 'mb-4 p-4 border border-gold-500/30 rounded bg-gold-500/5';
        imgContainer.innerHTML = `<label class="block text-sm font-bold mb-2 text-royal-900">صورة الغلاف (Hero Image)</label>`;
        
        const imgInput = document.createElement('input');
        imgInput.type = 'text';
        imgInput.className = 'w-full p-2 border rounded mb-2';
        imgInput.value = currentData.profile.hero_image;
        imgInput.placeholder = 'https://...';
        
        const imgPreview = document.createElement('img');
        imgPreview.src = currentData.profile.hero_image;
        imgPreview.className = 'w-32 h-32 object-cover rounded-full border-4 border-royal-900 mx-auto shadow-lg';
        
        imgInput.oninput = (e) => {
            currentData.profile.hero_image = e.target.value;
            imgPreview.src = e.target.value;
            renderPreview();
        };
        
        imgContainer.appendChild(imgInput);
        imgContainer.appendChild(imgPreview);
        container.appendChild(imgContainer);

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
    else if (currentTab === 'guestbook') {
        renderGuestbookAdmin(container);
    }
}

function renderGuestbookAdmin(container) {
    container.innerHTML = '<div class="text-center text-gray-500">جاري تحميل التعليقات...</div>';
    
    if (!db) {
        container.innerHTML = '<div class="text-red-500">خطأ: لم يتم تهيئة Firebase. تأكد من الإعدادات في الكود.</div>';
        return;
    }

    db.ref('guestbook').on('value', (snapshot) => {
        container.innerHTML = '';
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<div class="text-gray-500">لا توجد تعليقات حتى الآن.</div>';
            return;
        }

        const comments = Object.entries(data).map(([key, val]) => ({ id: key, ...val }))
                              .sort((a, b) => b.timestamp - a.timestamp);

        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 p-4 rounded border border-gray-200 mb-4 relative';
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-royal-900">${comment.name} <span class="text-xs font-normal text-gray-500">(${comment.email || 'No Email'})</span></h4>
                        <p class="text-gray-700 mt-1">${comment.message}</p>
                        <p class="text-xs text-gray-400 mt-1">${new Date(comment.timestamp).toLocaleString('ar-EG')}</p>
                    </div>
                    <button onclick="deleteComment('${comment.id}')" class="text-red-500 hover:text-red-700 text-sm font-bold">حذف</button>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <label class="block text-xs font-bold text-gold-500 mb-1">الرد:</label>
                    <div class="flex gap-2">
                        <input type="text" id="reply-${comment.id}" value="${comment.reply || ''}" class="flex-1 p-2 border rounded text-sm" placeholder="اكتب ردك هنا...">
                        <button onclick="saveReply('${comment.id}')" class="bg-royal-900 text-white px-3 py-1 rounded text-sm hover:bg-royal-800">حفظ الرد</button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    });
}

window.deleteComment = function(id) {
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
        db.ref('guestbook/' + id).remove();
    }
};

window.saveReply = function(id) {
    const replyText = document.getElementById(`reply-${id}`).value;
    db.ref('guestbook/' + id).update({ reply: replyText }).then(() => {
        alert('تم حفظ الرد بنجاح');
    });
};

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

// --- Preview Rendering ---
function renderPreview() {
    const container = document.getElementById('preview-container');
    container.innerHTML = '';

    if (currentTab === 'guestbook') {
        container.innerHTML = `
            <div class="flex items-center justify-center h-full text-center p-6">
                <div>
                    <h3 class="text-xl font-bold text-royal-900 mb-2">معاينة سجل الزوار</h3>
                    <p class="text-gray-500">التعليقات تظهر مباشرة في الموقع ولا تحتاج إلى معاينة هنا.</p>
                    <p class="text-sm text-gold-500 mt-4">استخدم القسم الأيمن لإدارة التعليقات والرد عليها.</p>
                </div>
            </div>
        `;
        return;
    }

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