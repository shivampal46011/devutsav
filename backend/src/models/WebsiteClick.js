import mongoose from 'mongoose';

const websiteClickSchema = new mongoose.Schema({
  user_session_id: { type: String, ref: 'UserSession' },
  url: { type: String, required: true },
  cta: { type: String },
  deep_link: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export default mongoose.model('WebsiteClick', websiteClickSchema);
