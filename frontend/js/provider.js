const API_BASE = 'http://localhost:5000/api';
const providerId = new URLSearchParams(window.location.search).get('id');
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  if (!providerId) return;
  loadProvider();
  loadReviews();
  setupStarPicker();
  document.getElementById('reviewForm').addEventListener('submit', submitReview);
});

async function loadProvider() {
  const res = await fetch(`${API_BASE}/providers/${providerId}`);
  const p = await res.json();

  document.getElementById('providerContent').innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <img src="${p.images?.[0] || 'https://placehold.co/300x200?text=' + encodeURIComponent(p.shopName)}"
           class="w-full md:w-64 h-40 object-cover rounded-lg" />
      <div class="flex-1">
        <h2 class="text-2xl font-bold mb-1">${p.shopName}</h2>
        <span class="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full mb-2">${p.category}</span>
        <p class="text-gray-600 mb-3">${p.description || ''}</p>
        <div class="flex items-center gap-1 star-rating mb-3">
          ${'★'.repeat(Math.round(p.ratingAverage || 0))}${'☆'.repeat(5 - Math.round(p.ratingAverage || 0))}
          <span class="text-gray-500 mr-1 text-sm">(${p.ratingCount || 0} تقييم)</span>
        </div>
        <div class="flex gap-3">
          <a href="tel:${p.phone}" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">📞 اتصال</a>
          ${p.whatsapp ? `<a href="https://wa.me/${p.whatsapp}" target="_blank" class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600">واتساب</a>` : ''}
        </div>
      </div>
    </div>
  `;

  document.getElementById('gallery').innerHTML = (p.images || [])
    .map((img) => `<img src="${img}" class="w-full h-28 object-cover rounded-lg" />`)
    .join('');
}

async function loadReviews() {
  const res = await fetch(`${API_BASE}/reviews/${providerId}`);
  const reviews = await res.json();

  document.getElementById('reviewsList').innerHTML = reviews.length
    ? reviews
        .map(
          (r) => `
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-center mb-1">
          <span class="font-medium">${r.user?.name || 'مستخدم'}</span>
          <span class="star-rating text-sm">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <p class="text-gray-600 text-sm">${r.comment || ''}</p>
      </div>`
        )
        .join('')
    : '<p class="text-gray-400 text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p>';
}

function setupStarPicker() {
  const stars = document.querySelectorAll('#starPicker span');
  stars.forEach((star) => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      stars.forEach((s) => {
        s.classList.toggle('text-amber-500', parseInt(s.dataset.value) <= selectedRating);
        s.classList.toggle('text-gray-300', parseInt(s.dataset.value) > selectedRating);
      });
    });
  });
}

async function submitReview(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('يرجى تسجيل الدخول أولاً لإضافة تقييم');
    return;
  }
  if (!selectedRating) {
    alert('يرجى اختيار عدد النجوم');
    return;
  }

  const comment = document.getElementById('commentInput').value.trim();

  const res = await fetch(`${API_BASE}/reviews/${providerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating: selectedRating, comment }),
  });

  if (res.ok) {
    document.getElementById('reviewForm').reset();
    selectedRating = 0;
    loadProvider();
    loadReviews();
  } else {
    const err = await res.json();
    alert(err.message || 'حدث خطأ أثناء إرسال التقييم');
  }
}
