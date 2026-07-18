const API_BASE = 'http://localhost:5000/api';
let pickMap, selectedMarker, selectedLat, selectedLng;

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupAuthForms();
  document.getElementById('logoutBtn').addEventListener('click', logout);

  if (localStorage.getItem('token')) {
    showProviderForm();
  }
});

// ---------------- تبويبات تسجيل الدخول / التسجيل ----------------
function setupTabs() {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('border-b-2', 'border-blue-600', 'font-medium');
    tabLogin.classList.remove('text-gray-400');
    tabRegister.classList.remove('border-b-2', 'border-blue-600', 'font-medium');
    tabRegister.classList.add('text-gray-400');
    loginForm.classList.remove('hidden');
    loginForm.classList.add('flex');
    registerForm.classList.add('hidden');
    registerForm.classList.remove('flex');
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('border-b-2', 'border-blue-600', 'font-medium');
    tabRegister.classList.remove('text-gray-400');
    tabLogin.classList.remove('border-b-2', 'border-blue-600', 'font-medium');
    tabLogin.classList.add('text-gray-400');
    registerForm.classList.remove('hidden');
    registerForm.classList.add('flex');
    loginForm.classList.add('hidden');
    loginForm.classList.remove('flex');
  });
}

function setupAuthForms() {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;
    await authenticate('/auth/login', { phone, password });
  });

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    await authenticate('/auth/register', { name, phone, password, role });
  });
}

async function authenticate(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'حدث خطأ');
      return;
    }

    localStorage.setItem('token', data.token);
    showProviderForm();
  } catch (err) {
    alert('تعذر الاتصال بالسيرفر');
  }
}

function logout() {
  localStorage.removeItem('token');
  location.reload();
}

// ---------------- نموذج بيانات مقدم الخدمة ----------------
function showProviderForm() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('providerFormSection').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');

  initPickMap();
  loadExistingProfile();
  document.getElementById('providerForm').addEventListener('submit', saveProvider);
}

function initPickMap() {
  pickMap = L.map('pickMap').setView([33.3152, 44.3661], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(pickMap);

  // محاولة تحديد موقع مقدم الخدمة تلقائياً كنقطة بداية
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      pickMap.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  }

  pickMap.on('click', (e) => {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    if (selectedMarker) pickMap.removeLayer(selectedMarker);
    selectedMarker = L.marker([selectedLat, selectedLng]).addTo(pickMap);

    document.getElementById('coordsDisplay').textContent =
      `الموقع المحدد: ${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`;
  });
}

async function loadExistingProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/providers/me/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const p = await res.json();
  if (!p) return;

  document.getElementById('shopName').value = p.shopName || '';
  document.getElementById('category').value = p.category || '';
  document.getElementById('description').value = p.description || '';
  document.getElementById('phone').value = p.phone || '';
  document.getElementById('whatsapp').value = p.whatsapp || '';
  document.getElementById('address').value = p.address || '';

  if (p.location?.coordinates) {
    const [lng, lat] = p.location.coordinates;
    selectedLat = lat;
    selectedLng = lng;
    pickMap.setView([lat, lng], 14);
    selectedMarker = L.marker([lat, lng]).addTo(pickMap);
    document.getElementById('coordsDisplay').textContent = `الموقع المحدد: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function saveProvider(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const statusEl = document.getElementById('saveStatus');

  if (!selectedLat || !selectedLng) {
    statusEl.textContent = '⚠️ يرجى تحديد موقعك على الخريطة أولاً';
    statusEl.className = 'text-sm mt-3 text-red-500';
    return;
  }

  const payload = {
    shopName: document.getElementById('shopName').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    phone: document.getElementById('phone').value,
    whatsapp: document.getElementById('whatsapp').value,
    address: document.getElementById('address').value,
    lat: selectedLat,
    lng: selectedLng,
  };

  try {
    const res = await fetch(`${API_BASE}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      statusEl.textContent = '✅ تم حفظ بياناتك بنجاح';
      statusEl.className = 'text-sm mt-3 text-green-600';
    } else {
      statusEl.textContent = data.message || 'حدث خطأ أثناء الحفظ';
      statusEl.className = 'text-sm mt-3 text-red-500';
    }
  } catch {
    statusEl.textContent = 'تعذر الاتصال بالسيرفر';
    statusEl.className = 'text-sm mt-3 text-red-500';
  }
}
