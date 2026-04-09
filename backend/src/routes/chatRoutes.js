import express from 'express';
import { chatWithKundali } from '../services/bedrockService.js';
import UserSession from '../models/UserSession.js';

const router = express.Router();
const MAX_FREE_MESSAGES = 3;

router.post('/message', async (req, res) => {
  try {
    const { user_session_id, message, history } = req.body;

    if (!user_session_id || !message) {
      return res.status(400).json({ error: 'user_session_id and message are required' });
    }

    // Basic Paywall Logic
    // In a real app, this would check the DB for 'messages_sent' or subscription status
    // Here we rely on the length of the requested history array to trigger the threshold
    if (history && history.length >= MAX_FREE_MESSAGES * 2) { 
        // 2 per turn (user + assistant)
        return res.status(403).json({ 
            error: 'paywall_reached', 
            message: 'You have reached your limit of free Kundali questions. Unlock premium for unlimited access.' 
        });
    }

    const aiResponse = await chatWithKundali(message, history || []);

    res.json({
        content: aiResponse,
        paywall_reached: false
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error parsing chat' });
  }
});

export default router;
