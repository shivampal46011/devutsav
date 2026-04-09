import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema({
  user_session_id: { type: String, required: true, unique: true },
  first_landing_url: { type: String },
  browser_details: { type: String },
  device_details: { type: String },
  location: { type: Object }, // Used for Google Location API data
  count_of_sessions: { type: Number, default: 1 },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export default mongoose.model('UserSession', userSessionSchema);
