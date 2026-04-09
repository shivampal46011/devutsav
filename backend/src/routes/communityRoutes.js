import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.js';

const router = express.Router();

// Get feed
router.get('/posts', async (req, res) => {
  try {
    const posts = await CommunityPost.find().populate('user_id', 'full_name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a post & reward user with Blessing Points
router.post('/posts', async (req, res) => {
  try {
    const { user_id, image_url, caption } = req.body;
    
    const newPost = new CommunityPost({
      user_id,
      image_url,
      caption
    });

    await newPost.save();

    // Reward user 50 Blessing Points for posting their setup
    const user = await User.findById(user_id);
    if (user) {
        user.blessing_points += 50;
        await user.save();
    }

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
