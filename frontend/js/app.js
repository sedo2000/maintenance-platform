// =====================================================
// منطق الصفحة الرئيسية
// =====================================================

const API_BASE = 'http://localhost:5000/api';

const CATEGORIES = [
  { key: 'تبريد وتكييف', icon: '❄️' },
  { key: 'سباكة', icon: '🚰' },
  { key: 'كهرباء', icon: '💡' },
  { key: 'صيانة إلكترونيات', icon: '📺' },
  { key: 'صيانة هواتف وحاسبات', icon: '📱' },
  { key: 'نجارة', icon: '🪚' },
  { key: 'دهان', icon: '🎨' },
  { key: 'أخرى', icon: '🛠️' },
];

let map, markersLayer;

// ----------------- تهيئة الصفحة -----------------
document.addEventListener('DOMContentLoaded', async () => {
  renderCategories();
  initMap();

  try {
    const { lat, lng } = await requestUserLocation();
    map.setView([lat, lng], 13);
    L.marker([lat, lng]).addTo(map).bindPopup('موقعك الحالي').openPopup();
    fetchNearbyProviders(lat, lng);
  } catch (err) {
    // فشل تحديد الموقع - نترك الخريطة على العرض الافتراضي وننتظر بحثاً يدوياً
    console.warn('تعذر تحديد الموقع:', err.message);
  }

  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('radiusSelect').addEventListener('change', handleSearch);
});

function initMap() {
  // عرض افتراضي (يمكن تغييره لمركز مدينتك) - سيتم تحديثه فور معرفة موقع المستخدم
  map = L.map('map').setView([33.3152, 44.3661], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function renderCategories() {
  const container = document.getElementById('categoriesList');
  container.innerHTML = CATEGORIES.map(
    (cat) => `
    <button data-category="${cat.key}"
      class="category-btn bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md border hover:border-blue-400 transition">
      <div class="text-3xl mb-2">${cat.icon}</div>
      <div class="text-sm font-medium">${cat.key}</div>
    </button>`
  ).join('');

  container.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      handleSearch(btn.dataset.category);
    });
  });
}

async function handleSearch(categoryOrEvent) {
  const category = typeof categoryOrEvent === 'string' ? categoryOrEvent : null;
  const search = document.getElementById('searchInput').value.trim();
  const radius = document.getElementById('radiusSelect').value;

  if (!AppState.userLat || !AppState.userLng) {
    try {
      await requestUserLocation();
    } catch {
      alert('يرجى السماح بالوصول لموقعك الجغرافي لعرض أقرب النتائج');
      return;
    }
  }

  fetchNearbyProviders(AppState.userLat, AppState.userLng, radius, category, search);
}

async function fetchNearbyProviders(lat, lng, radius = 10, category = null, search = null) {
  try {
    const params = new URLSearchParams({ lat, lng, radius });
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/providers/nearby?${params.toString()}`);
    const data = await res.json();

    renderResults(data.providers || []);
    renderMapMarkers(data.providers || []);
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
  }
}

function renderResults(providers) {
  const grid = document.getElementById('resultsGrid');
  const emptyState = document.getElementById('emptyState');

  if (!providers.length) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  grid.innerHTML = providers
    .map(
      (p) => `
    <a href="provider.html?id=${p._id}" class="provider-card bg-white rounded-xl shadow-sm border overflow-hidden block">
      <img src="${p.images?.[0] || 'https://placehold.co/400x200?text=' + encodeURIComponent(p.shopName)}"
           class="w-full h-36 object-cover" alt="${p.shopName}" />
      <div class="p-4">
        <h4 class="font-bold text-lg mb-1">${p.shopName}</h4>
        <span class="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full mb-2">${p.category}</span>
        <div class="flex items-center gap-1 text-sm star-rating">
          ${'★'.repeat(Math.round(p.ratingAverage || 0))}${'☆'.repeat(5 - Math.round(p.ratingAverage || 0))}
          <span class="text-gray-500 mr-1">(${p.ratingCount || 0})</span>
        </div>
      </div>
    </a>`
    )
    .join('');
}

function renderMapMarkers(providers) {
  markersLayer.clearLayers();
  providers.forEach((p) => {
    const [lng, lat] = p.location.coordinates;
    L.marker([lat, lng])
      .addTo(markersLayer)
      .bindPopup(`<b>${p.shopName}</b><br>${p.category}`);
  });
}
