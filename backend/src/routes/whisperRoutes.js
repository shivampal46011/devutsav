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

    // Upsert User Profile logic to capture the petitioner details
    if (user_session_id || petitioner_phone || petitioner_email) {
      let user = await User.findOne({ 
        $or: [
            { user_session_id: user_session_id || "null_bypass" },
            { phone: petitioner_phone || "null_bypass" },
            { email: petitioner_email || "null_bypass" }
        ]
      });

      if (user) {
        if (petitioner_name) user.name = petitioner_name;
        if (petitioner_phone) user.phone = petitioner_phone;
        if (petitioner_email) user.email = petitioner_email;
        await user.save();
        uId = user._id;
      } else {
        user = new User({
            user_session_id,
            name: petitioner_name,
            phone: petitioner_phone,
            email: petitioner_email
        });
        await user.save();
        uId = user._id;
      }
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
