import mongoose from 'mongoose';

const blogSeriesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    sort_order: { type: Number, default: 0 },
    /** When true, hub shows the series as “coming soon” (teaser only). */
    coming_soon: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('BlogSeries', blogSeriesSchema);
