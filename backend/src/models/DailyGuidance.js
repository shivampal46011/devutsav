import mongoose from 'mongoose';

const dailyGuidanceSchema = new mongoose.Schema({
  horoscope_detail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HoroscopeDetail' },
  image_url: { type: String },
  is_active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export default mongoose.model('DailyGuidance', dailyGuidanceSchema);
