import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { user_session_id, email, phone } = req.body;

    let user;
    if (email) user = await User.findOne({ email });
    else if (phone) user = await User.findOne({ phone });
    else if (user_session_id) user = await User.findOne({ user_session_id });

    if (user) {
      const incoming = { ...req.body };
      // Don't overwrite an existing source — first form wins
      if (user.source && incoming.source) delete incoming.source;
      Object.assign(user, incoming);
      await user.save();
    } else {
      user = new User(req.body);
      await user.save();
    }

    res.status(201).json({ message: 'User stored', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
