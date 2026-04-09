import express from 'express';
import User from '../models/User.js';
import DoshaCalculator from '../models/DoshaCalculator.js';
import { analyzeKundali } from '../services/bedrockService.js';
import { runLLMDoshaCalculator } from '../services/llmDoshaCalculator.js';

const router = express.Router();

/**
 * @desc Generate Kundali and update user (Old Bedrock approach)
 * @route POST /api/kundali/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { user_id, user_session_id, dob, tob, pob } = req.body;

    if (!dob || !tob || !pob) {
      return res.status(400).json({ error: 'dob, tob, and pob are required' });
    }

    const kundali_link = `https://devutsav-bucket.s3.amazonaws.com/kundali/${Date.now()}.pdf`;

    let user;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (user_session_id) {
      user = await User.findOne({ user_session_id });
    }

    if (user) {
      user.kundali_link = kundali_link;
      user.dob = dob;
      user.tob = tob;
      user.pob = pob;
      await user.save();
    }

    const kundaliData = { dob, tob, pob, link: kundali_link };
    const doshas = await analyzeKundali(kundaliData, "India");

    if (user) {
      const doshaNames = doshas.map(d => d.doshaName);
      const doshaProfile = new DoshaCalculator({
        user_id: user._id,
        llm_output: JSON.stringify(doshas),
        dosha_name: doshaNames
      });
      await doshaProfile.save();
    }

    res.status(201).json({ 
      message: 'Kundali generated and analyzed', 
      kundali_link,
      doshas,
      userUpdated: !!user
    });
  } catch (error) {
    console.error('Kundali generation error:', error);
    res.status(500).json({ error: 'Server error generating kundali' });
  }
});

/**
 * @desc NEW: Analyze Dosha using LangChain LLM 
 * @route POST /api/kundali/analyze-dosha
 */
router.post('/analyze-dosha', async (req, res) => {
  try {
    const { user_id, user_session_id, dob, tob, tob_unknown, pob, pob_lat, pob_lon } = req.body;

    if (!dob || !pob) {
      return res.status(400).json({ error: 'dob and pob are required' });
    }

    // Call the new LLM service wrapper
    const report = await runLLMDoshaCalculator(req.body);
    const doshas = report.doshas || [];

    const kundali_link = `https://devutsav-bucket.s3.amazonaws.com/kundali/llm_${Date.now()}.pdf`;

    let user;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (user_session_id) {
      user = await User.findOne({ user_session_id });
    }

    if (user) {
      user.kundali_link = kundali_link;
      user.dob = dob;
      user.tob = tob_unknown ? 'Unknown' : tob;
      user.pob = pob;
      await user.save();

      const doshaNames = doshas.map(d => d.name);
      const doshaProfile = new DoshaCalculator({
        user_id: user._id,
        llm_output: JSON.stringify(doshas),
        dosha_name: doshaNames
      });
      await doshaProfile.save();
    }

    res.status(201).json({
      message: 'Kundali dosha analyzed via LLM',
      kundali_link,
      report,
      userUpdated: !!user
    });

  } catch (error) {
    console.error('LLM Dosha analysis error:', error);
    res.status(500).json({ error: 'Server error running LLM Dosha analysis' });
  }
});

export default router;
