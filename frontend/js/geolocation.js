// =====================================================
// وحدة تحديد الموقع الجغرافي للمستخدم
// =====================================================

const AppState = {
  userLat: null,
  userLng: null,
};

/**
 * تطلب من المتصفح إذن الوصول لموقع المستخدم
 * وتعيد Promise يحتوي على الإحداثيات
 */
function requestUserLocation() {
  return new Promise((resolve, reject) => {
    const statusEl = document.getElementById('locationStatus');

    if (!navigator.geolocation) {
      statusEl.textContent = 'المتصفح لا يدعم تحديد الموقع الجغرافي';
      reject(new Error('Geolocation not supported'));
      return;
    }

    statusEl.textContent = 'جاري تحديد موقعك...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        AppState.userLat = position.coords.latitude;
        AppState.userLng = position.coords.longitude;
        statusEl.textContent = '✅ تم تحديد موقعك بنجاح';
        resolve({ lat: AppState.userLat, lng: AppState.userLng });
      },
      (error) => {
        // في حال رفض المستخدم الإذن، نستخدم موقعاً افتراضياً (مثال: مركز المدينة)
        statusEl.textContent = 'لم نتمكن من تحديد موقعك. يمكنك البحث يدوياً.';
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
