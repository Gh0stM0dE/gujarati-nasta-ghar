// --- Supabase Config ---
// Renamed 'supabase' to 'supabaseClient' to avoid name collision
const SUB_URL = "https://kudajtbzbqbuziwpfxzj.supabase.co"; 
const SUB_KEY = "sb_publishable_pjxsVdV79a5eFUl0TgANBg_SyRZrPj2"; 

const supabaseClient = window.supabase.createClient(SUB_URL, SUB_KEY);

// --- Business Opening Status Logic ---
function initStatus() {
    const now = new Date();
    const time = now.getHours() + (now.getMinutes() / 60);
    const badge = document.getElementById('status-badge');
    
    if (!badge) return;

    // Logic: 8:00 AM to 8:30 PM (20.5)
    if (time >= 8 && time < 20.5) {
        badge.innerHTML = '<span class="badge-dot badge-open"></span> Open Now';
        badge.style.color = "#2ecc71";
    } else {
        badge.innerHTML = '<span class="badge-dot badge-closed"></span> Closed Now';
        badge.style.color = "#e74c3c";
    }
}

// --- Dynamic Menu Loader ---
async function loadMenu() {
    try {
        // Using the renamed client here
        const { data, error } = await supabaseClient.from('items').select('*');
        if (error) throw error;
        
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        
        renderMenu(data);
    } catch (err) {
        console.error(err);
        const loader = document.getElementById('loader');
        if (loader) loader.innerHTML = "Failed to load menu. Please call us.";
    }
}

function renderMenu(items) {
    const container = document.getElementById('menu-display');
    if (!container) return;

    const categories = items.reduce((acc, item) => {
        const cat = item.category.trim().toUpperCase();
        acc[cat] = acc[cat] || [];
        acc[cat].push(item);
        return acc;
    }, {});

    const order = ["SAMOSA AND PATIS", "DIET KHAKHRA", "SPECIAL NASTA", "SPECIAL ITEMS"];
    let html = '';

    order.forEach(cat => {
        if (categories[cat]) {
            let lastUnit = '';
            let listHTML = '';

            // --- FIXED SORTING LOGIC ---
            categories[cat].sort((a, b) => {
                // 1. First, group by unit (e.g., Per Kg items stay together)
                const unitCompare = a.unit.localeCompare(b.unit);
                if (unitCompare !== 0) return unitCompare;

                // 2. Second, sort by Price (Lowest to Highest)
                return a.price - b.price;
            });

            categories[cat].forEach(item => {
                // Add the orange sub-header when the unit changes (e.g., switching from Kg to Plate)
                if (item.unit !== lastUnit) {
                    listHTML += `<li class="small-header">Price(₹) / ${item.unit}</li>`;
                    lastUnit = item.unit;
                }
                listHTML += `<li><span>${item.name}</span><span>${item.price}</span></li>`;
            });

            html += `
                <div class="menu-category">
                    <h3 class="cat-title">${cat} <i class="fas fa-chevron-down"></i></h3>
                    <ul>${listHTML}</ul>
                </div>
            `;
        }
    });
    container.innerHTML = html;
}
// Ensure the scripts run after the HTML is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initStatus();
    loadMenu();
    setInterval(initStatus, 60000); 
});
