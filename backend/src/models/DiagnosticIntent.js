import mongoose from 'mongoose';

const diagnosticIntentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  primary_concern: { 
    type: String, 
    enum: ['Career & Purpose', 'Connection', 'Health', 'Other']
  },
  completion_status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED'],
    default: 'IN_PROGRESS'
  },
  current_step: { type: Number, default: 1 },
  generated_solution: { type: mongoose.Schema.Types.Mixed }, // flexible JSON for insights
}, {
  timestamps: true
});

export default mongoose.model('DiagnosticIntent', diagnosticIntentSchema);
