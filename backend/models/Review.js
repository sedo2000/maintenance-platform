const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// منع نفس المستخدم من تقييم نفس مقدم الخدمة أكثر من مرة
reviewSchema.index({ provider: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
