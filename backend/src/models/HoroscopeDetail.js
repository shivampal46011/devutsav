import mongoose from 'mongoose';

const horoscopeDetailSchema = new mongoose.Schema({
  zodiac: { 
    type: String, 
    required: true,
    enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
  },
  type: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'], 
    required: true 
  },
  date: { type: String }, // e.g. "2026-04-02"
  week_start: { type: String }, // e.g. "2026-04-01"
  month: { type: String }, // e.g. "2026-04"
  content_hindi: { type: String, required: true },
  content_english: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('HoroscopeDetail', horoscopeDetailSchema);
