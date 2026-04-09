import mongoose from 'mongoose';

const promptScheduleSchema = new mongoose.Schema({
  prompt_text: { type: String, required: true },
  cron_expression: { type: String, default: '0 0 * * *' }, // Daily at midnight
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('PromptSchedule', promptScheduleSchema);
