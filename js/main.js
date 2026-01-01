document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    loadData();
    document.getElementById('year').textContent = new Date().getFullYear();
});

// --- Mobile Menu ---
function initMobileMenu() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    
    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu when clicking a link
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

// --- Data Loading ---
async function loadData() {
    try {
        const response = await fetch('./data/data.json');
        if (!response.ok) throw new Error('Failed to load data');
        const data = await response.json();
        
        renderHero(data.profile);
        renderSocials(data.socials);
        renderAbout(data.profile);
        renderPrograms(data.programs);
        renderVideos(data.videos);
        renderGallery(data.gallery);
        
        // Init animations after content is loaded
        initAnimations();
        
    } catch (error) {
        console.error('Error loading site data:', error);
        // Fallback content or alert could go here
    }
}

// --- Render Functions ---

function renderHero(profile) {
    document.getElementById('hero-title').textContent = profile.title;
    document.getElementById('hero-name').textContent = profile.name;
    document.getElementById('hero-bio').textContent = profile.bio_short;
    document.getElementById('hero-image').src = profile.hero_image;
    document.getElementById('nav-logo').textContent = profile.logo_text || "SALAM";
}

function renderAbout(profile) {
    document.getElementById('about-text').textContent = profile.bio_full;
}

function renderSocials(socials) {
    const container = document.getElementById('hero-socials');
    const footerContainer = document.getElementById('footer-socials');
    const contactBtn = document.getElementById('contact-email');
    
    if (socials.email) {
        contactBtn.href = `mailto:${socials.email}`;
    }

    const icons = {
        instagram: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        twitter: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
        facebook: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>',
        youtube: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
        tiktok: '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.98 6.38-2.24 1.84-5.27 2.43-8.01 1.62-2.93-.88-5.12-3.17-5.86-6.11-.72-2.9.53-5.96 3.07-7.7 2.17-1.49 4.83-1.66 7.13-.52v4.45c-.82-.57-1.86-.73-2.85-.43-1.18.35-2.12 1.21-2.55 2.33-.41 1.11-.18 2.35.63 3.28.81.93 2.03 1.34 3.24 1.13 1.23-.22 2.19-1.17 2.47-2.38.06-.26.09-.52.09-.78V.02h-2.46z"/></svg>'
    };

    Object.keys(socials).forEach(key => {
        if (icons[key] && socials[key]) {
            const link = document.createElement('a');
            link.href = socials[key];
            link.target = '_blank';
            link.className = 'text-gray-400 hover:text-gold-500 transition-colors duration-300';
            link.innerHTML = icons[key];
            
            container.appendChild(link.cloneNode(true));
            footerContainer.appendChild(link.cloneNode(true));
        }
    });
}

function renderPrograms(programs) {
    const grid = document.getElementById('programs-grid');
    programs.forEach(prog => {
        const card = document.createElement('div');
        card.className = 'bg-royal-900 rounded-xl overflow-hidden shadow-lg hover:shadow-gold-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-white/5 reveal';
        card.innerHTML = `
            <div class="h-48 overflow-hidden">
                <img src="${prog.image}" alt="${prog.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
            </div>
            <div class="p-6">
                <span class="text-gold-500 text-sm font-semibold tracking-wider">${prog.channel}</span>
                <h3 class="text-xl font-bold text-white mt-2 mb-3">${prog.title}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">${prog.description}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderVideos(videos) {
    const grid = document.getElementById('videos-grid');
    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'bg-black rounded-xl overflow-hidden shadow-lg border border-white/5 reveal';
        
        // Check if it's a YouTube embed URL
        let embedUrl = video.url;
        if(video.url.includes('watch?v=')) {
            embedUrl = video.url.replace('watch?v=', 'embed/');
        }

        card.innerHTML = `
            <div class="aspect-w-16 aspect-h-9">
                <iframe src="${embedUrl}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-64 md:h-80"></iframe>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-bold text-white">${video.title}</h3>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderGallery(images) {
    const grid = document.getElementById('gallery-grid');
    images.forEach(imgSrc => {
        const div = document.createElement('div');
        div.className = 'relative group overflow-hidden rounded-lg aspect-square reveal';
        div.innerHTML = `
            <img src="${imgSrc}" alt="Gallery Image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span class="text-gold-500 font-bold">عرض</span>
            </div>
        `;
        grid.appendChild(div);
    });
}

// --- Animations ---
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}