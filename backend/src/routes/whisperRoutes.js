import express from 'express';
import Whisper from '../models/Whisper.js';
import User from '../models/User.js';

const router = express.Router();

// Submit a whisper
router.post('/', async (req, res) => {
  try {
    const { user_session_id, user_id, wish_text, wish_audio, petitioner_name, petitioner_gotra, petitioner_email, petitioner_phone, sankalp_taken } = req.body;
    
    // Abstracted: S3 upload of base64 wish_audio happens here if provided. 
    // For now we accept a string/link if passed from frontend.
    
    let uId = user_id;

    // We skip robust User creation/mutation here entirely.
    // Nandi Whispers shouldn't aggressively write user records since it triggers Duplicate Key (E11000) for mapped phones.
    if (!uId && user_session_id) {
       let user = await User.findOne({ 
        $or: [
            { user_session_id: user_session_id },
            { phone: petitioner_phone || "null_bypass" }
        ]
       });
       if (user) uId = user._id;
    }

    const newWhisper = new Whisper({
      user_id: uId,
      wish_text,
      wish_audio,
      petitioner_name,
      petitioner_gotra,
      sankalp_taken
    });

    await newWhisper.save();

    res.status(201).json({ 
        message: 'Tathastu', 
        whisper: newWhisper 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all whispers (for admin or temple queue)
router.get('/', async (req, res) => {
  try {
    const whispers = await Whisper.find().sort({ createdAt: -1 });
    res.json(whispers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
