# فني قريب — منصة خدمات الصيانة القريبة

## طريقة التشغيل

### 1. تشغيل قاعدة البيانات
تحتاج MongoDB (محلياً أو عبر MongoDB Atlas مجاناً):
```bash
# محلياً (إذا كان مثبتاً)
mongod
```
أو أنشئ Cluster مجاني على https://www.mongodb.com/cloud/atlas واستخدم رابط الاتصال (Connection String).

### 2. إعداد الـ Backend
```bash
cd backend
cp .env.example .env
# عدّل MONGO_URI و JWT_SECRET في ملف .env
npm install
npm run dev
```
السيرفر سيعمل على: http://localhost:5000

### 3. تشغيل الـ Frontend
أبسط طريقة: افتح `frontend/index.html` مباشرة عبر إضافة Live Server في VS Code،
أو اجعل Express يخدمها تلقائياً (مُفعّل بالفعل في server.js عبر express.static)
فتصبح متاحة على: http://localhost:5000

## نقاط النهاية الرئيسية (API Endpoints)

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | /api/auth/register | تسجيل حساب جديد |
| POST | /api/auth/login | تسجيل الدخول |
| GET | /api/providers/nearby?lat=&lng=&radius= | جلب أقرب مقدمي الخدمة |
| GET | /api/providers/:id | بروفايل مقدم خدمة |
| POST | /api/providers | إنشاء/تحديث ملف مقدم الخدمة (يتطلب توكن) |
| GET | /api/providers/me/profile | بيانات مقدم الخدمة المسجل دخوله |
| GET | /api/reviews/:providerId | تقييمات مقدم خدمة |
| POST | /api/reviews/:providerId | إضافة تقييم (يتطلب توكن) |

## خطوات تطوير مستقبلية مقترحة
- رفع الصور فعلياً عبر Multer + تخزين سحابي (Cloudinary / S3) بدل روابط نصية.
- تفعيل حد أقصى لعدد الطلبات (Rate Limiting) وتحقق أعمق من المدخلات (express-validator).
- إشعارات فورية (Socket.io) عند استلام طلب خدمة جديد.
- تطبيق نظام "طلب خدمة" مباشر بدل الاكتفاء برقم الهاتف.
