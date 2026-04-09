import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  caption: { type: String },
  likes_count: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('CommunityPost', communityPostSchema);
