import mongoose from 'mongoose';

const guidanceSubscriberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    isd_code: { type: String, default: '+91', trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    pob: { type: String, trim: true },
    pob_lat: { type: Number },
    pob_lon: { type: Number },
    pob_city: { type: String, trim: true },
    pob_state: { type: String, trim: true },
    pob_country: { type: String, trim: true },
    pob_place_id: { type: String, trim: true },
    dob: { type: String, trim: true }, // YYYY-MM-DD
    tob: { type: String, trim: true }, // HH:mm
    email_subscribe: { type: Boolean, default: false },
    last_emailed_at: { type: Date },
    source: { type: String, default: 'home_daily_guidance' },
    user_session_id: { type: String, index: true },
  },
  { timestamps: true }
);

guidanceSubscriberSchema.index({ phone: 1, email: 1 });

export default mongoose.model('GuidanceSubscriber', guidanceSubscriberSchema);
