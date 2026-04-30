import mongoose from 'mongoose';

const scheduleRunSchema = new mongoose.Schema(
  {
    job_name: { type: String, required: true, index: true },
    cron_expression: { type: String },
    started_at: { type: Date, default: Date.now, index: true },
    ended_at: { type: Date },
    duration_ms: { type: Number },
    status: { type: String, enum: ['running', 'success', 'error'], default: 'running' },
    items_processed: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: false }
);

scheduleRunSchema.index({ job_name: 1, started_at: -1 });

export default mongoose.model('ScheduleRun', scheduleRunSchema);
