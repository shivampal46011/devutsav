import express from 'express';
import UserSession from '../models/UserSession.js';
import WebsiteClick from '../models/WebsiteClick.js';

const router = express.Router();

/**
 * @desc Create or update a user session
 * @route POST /api/tracking/sessions
 */
router.post('/sessions', async (req, res) => {
  try {
    const { user_session_id, first_landing_url, browser_details, device_details, location } = req.body;

    if (!user_session_id) {
      return res.status(400).json({ error: 'user_session_id is required' });
    }

    let session = await UserSession.findOne({ user_session_id });
    if (session) {
      session.count_of_sessions += 1;
      await session.save();
    } else {
      session = new UserSession({
        user_session_id,
        first_landing_url,
        browser_details,
        device_details,
        location,
        count_of_sessions: 1
      });
      await session.save();
    }
    
    res.status(201).json({ message: 'Session tracked', session });
  } catch (error) {
    console.error('Session tracking error:', error);
    res.status(500).json({ error: 'Server error tracking session' });
  }
});

/**
 * @desc Track a website click or CTA interaction
 * @route POST /api/tracking/click
 */
router.post('/click', async (req, res) => {
  try {
    const { user_session_id, url, cta, deep_link } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const click = new WebsiteClick({
      user_session_id,
      url,
      cta,
      deep_link
    });

    await click.save();
    res.status(201).json({ message: 'Click tracked', click });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Server error tracking click' });
  }
});

export default router;
