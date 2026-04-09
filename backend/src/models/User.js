import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  user_session_id: { type: String, ref: 'UserSession' },
  isd_code: { type: String },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  name: { type: String },
  dob: { type: Date },
  tob: { type: String }, // Format 24 Hours IST "HH:mm"
  pob: { type: String },
  kundali_link: { type: String },
  sun_sign: { type: String },
  moon_sign: { type: String },
  
  // Existing App State fields carried over
  blessing_points: { type: Number, default: 0 },
  current_dosha: { type: String },
  active_planetary_transit: { type: String },
  spiritual_insight: { type: String },
  recommended_rituals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ritual' }],
  
  // DevPunya Auth
  devpunya_token: { type: String },
  devpunya_user_id: { type: String },
  
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
