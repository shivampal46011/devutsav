import mongoose from 'mongoose';

const promptScheduleSchema = new mongoose.Schema({
  prompt_text: { type: String, required: true },
  cron_expression: { type: String, default: '0 0 * * *' },
  is_active: { type: Boolean, default: true },
  last_run_at: { type: Date },
  last_status: { type: String, enum: ['success', 'error', null], default: null },
  last_error: { type: String },
  last_duration_ms: { type: Number },
}, {
  timestamps: true
});

export default mongoose.model('PromptSchedule', promptScheduleSchema);
