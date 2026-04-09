import express from 'express';
import DiagnosticIntent from '../models/DiagnosticIntent.js';
import User from '../models/User.js';

const router = express.Router();

// Create new analyzer intent
router.post('/intent', async (req, res) => {
  try {
    const { user_id, primary_concern } = req.body;
    
    const newIntent = new DiagnosticIntent({
      user_id,
      primary_concern,
      current_step: 2
    });

    await newIntent.save();
    res.status(201).json(newIntent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analyzer solution
router.get('/solution/:intentId', async (req, res) => {
  try {
    const intent = await DiagnosticIntent.findById(req.params.intentId);
    if (!intent) return res.status(404).json({ message: 'Intent not found' });
    
    // MOCK solution generation
    intent.completion_status = 'COMPLETED';
    intent.generated_solution = {
      insight: 'The Saturn Cycle',
      description: 'Many seekers find that recurring relationship friction aligns with specific planetary transits. Your diagnostic helps pinpoint these karmic windows.'
    };
    await intent.save();

    // Optionally update the user's signals with this insight
    if (intent.user_id) {
        await User.findByIdAndUpdate(intent.user_id, {
            spiritual_insight: intent.generated_solution.insight,
            active_planetary_transit: 'Saturn Transit'
        });
    }

    res.json(intent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
