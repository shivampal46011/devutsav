import mongoose from 'mongoose';

const whisperSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wish_audio: { type: String }, // S3 Link to audio if provided
  wish_text: { type: String },
  
  // Legacy petitioner fields for anonymous users or extra details
  petitioner_name: { type: String },
  petitioner_gotra: { type: String },
  petitioner_dob: { type: Date },
  petitioner_tob: { type: String },
  petitioner_pob: { type: String },
  sankalp_taken: { type: Boolean, default: false },
  
  status: {
    type: String,
    enum: ['PENDING', 'OFFERED_AT_TEMPLE'],
    default: 'PENDING'
  },
  deletedAt: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Whisper', whisperSchema);
