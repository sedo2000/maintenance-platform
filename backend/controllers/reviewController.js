const Review = require('../models/Review');
const Provider = require('../models/Provider');

// دالة مساعدة لإعادة حساب متوسط التقييم
const recalculateRating = async (providerId) => {
  const stats = await Review.aggregate([
    { $match: { provider: providerId } },
    { $group: { _id: '$provider', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Provider.findByIdAndUpdate(providerId, {
    ratingAverage: stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    ratingCount: stats.length ? stats[0].count : 0,
  });
};

// @route POST /api/reviews/:providerId
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { providerId } = req.params;

    const existing = await Review.findOne({ provider: providerId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'لقد قمت بتقييم هذا المزود مسبقاً' });
    }

    const review = await Review.create({
      provider: providerId,
      user: req.user._id,
      rating,
      comment,
    });

    await recalculateRating(providerId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// @route GET /api/reviews/:providerId
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};
