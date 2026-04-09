import mongoose from 'mongoose';

const doshaCalculatorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  llm_output: { type: String },
  dosha_name: [{ type: String }],
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true
});

export default mongoose.model('DoshaCalculator', doshaCalculatorSchema);
