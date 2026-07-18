const Provider = require('../models/Provider');

// @route GET /api/providers/nearby?lat=..&lng=..&radius=..&category=..
// جلب أقرب مقدمي الخدمة ضمن نطاق جغرافي محدد (بالكيلومتر)
exports.getNearbyProviders = async (req, res) => {
  try {
    const { lat, lng, radius = 10, category, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'يجب إرسال الإحداثيات (lat, lng)' });
    }

    const radiusInMeters = parseFloat(radius) * 1000;

    const query = {
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const providers = await Provider.find(query).limit(50);

    res.json({ count: providers.length, providers });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// @route GET /api/providers/:id
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', 'name phone');
    if (!provider) return res.status(404).json({ message: 'مقدم الخدمة غير موجود' });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// @route POST /api/providers  (لوحة تحكم مقدم الخدمة - إنشاء/إكمال الملف)
exports.createOrUpdateProvider = async (req, res) => {
  try {
    const { shopName, category, description, phone, whatsapp, address, lat, lng, images } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'يجب تحديد الموقع الجغرافي على الخريطة' });
    }

    let provider = await Provider.findOne({ user: req.user._id });

    const data = {
      user: req.user._id,
      shopName,
      category,
      description,
      phone,
      whatsapp,
      address,
      images: images || [],
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
    };

    if (provider) {
      provider = await Provider.findOneAndUpdate({ user: req.user._id }, data, { new: true });
    } else {
      provider = await Provider.create(data);
    }

    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// @route GET /api/providers/me/profile (بيانات مقدم الخدمة المسجل دخوله)
exports.getMyProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};
