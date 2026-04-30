import mongoose from 'mongoose';

const dailyTipSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true }, // YYYY-MM-DD
    title: { type: String, required: true },
    body: { type: String, required: true },
    generated_by: { type: String, default: 'bedrock' },
    status: { type: String, enum: ['active', 'fallback'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('DailyTip', dailyTipSchema);
