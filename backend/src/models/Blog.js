import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content_md: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PUBLISHED'], 
    default: 'DRAFT' 
  },
  generated_at: { type: Date, default: Date.now },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptSchedule' }
}, {
  timestamps: true
});

export default mongoose.model('Blog', blogSchema);
