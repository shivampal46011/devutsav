import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    session_id: { type: String, index: true },
    path: { type: String, index: true },
    section_id: { type: String },
    blog_slug: { type: String, index: true },
    value: { type: Number },
    duration_ms: { type: Number },
    scroll_pct: { type: Number },
    meta: { type: Object },
    user_agent: { type: String },
    referer: { type: String },
    ip_hash: { type: String },
    ts: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

analyticsEventSchema.index({ type: 1, ts: -1 });
analyticsEventSchema.index({ path: 1, ts: -1 });
analyticsEventSchema.index({ blog_slug: 1, ts: -1 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
