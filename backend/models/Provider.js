const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'تبريد وتكييف', // AC / Fridge repair
        'سباكة',
        'كهرباء',
        'صيانة إلكترونيات',
        'صيانة هواتف وحاسبات',
        'نجارة',
        'دهان',
        'أخرى',
      ],
    },
    description: { type: String, trim: true, maxlength: 1000 },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    images: [{ type: String }], // روابط صور الأعمال السابقة
    address: { type: String, trim: true },

    // موقع جغرافي بصيغة GeoJSON - إلزامي لأي استعلام جغرافي في MongoDB
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // ترتيب MongoDB الإلزامي: [longitude, latitude]
        type: [Number],
        required: true,
      },
    },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// فهرس جغرافي ضروري لعمل استعلامات $near و $geoWithin بكفاءة
providerSchema.index({ location: '2dsphere' });
// فهرس نصي للبحث الذكي عن اسم المحل أو التخصص
providerSchema.index({ shopName: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Provider', providerSchema);
