const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyProviders,
  getProviderById,
  createOrUpdateProvider,
  getMyProviderProfile,
} = require('../controllers/providerController');

// عام - بحث عن أقرب مقدمي الخدمة (لا يحتاج تسجيل دخول)
router.get('/nearby', getNearbyProviders);

// لوحة تحكم مقدم الخدمة - يجب أن تُعرَّف قبل /:id لتفادي التعارض
router.get('/me/profile', protect, authorize('provider'), getMyProviderProfile);
router.post('/', protect, authorize('provider'), createOrUpdateProvider);

// عام - عرض بروفايل مقدم خدمة محدد
router.get('/:id', getProviderById);

module.exports = router;
