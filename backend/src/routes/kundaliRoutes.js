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

/**
 * @desc Generate a Basic Kundali PDF via AstroNext partner API
 * @route POST /api/kundali/basic-report
 *
 * Accepts a user_id (preferred) and/or raw fields. Missing fields are
 * back-filled from the stored User document. Returns the AstroNext payload
 * unchanged (expected to include a PDF URL) plus a `pdf_url` convenience
 * field when we can detect one, and persists it to user.kundali_link.
 */
router.post('/basic-report', async (req, res) => {
  try {
    const {
      user_id,
      user_session_id,
      name, dob, tob, pob, pob_lat, pob_lon, tzone,
      gender, language, chart_style,
    } = req.body || {};

    let user = null;
    if (user_id) user = await User.findById(user_id).catch(() => null);
    if (!user && user_session_id) user = await User.findOne({ user_session_id });

    const finalName = (name || user?.name || '').trim();
    const finalPob = (pob || user?.pob || '').trim();
    const finalLat = pob_lat != null ? Number(pob_lat) : (user?.pob_lat ?? null);
    const finalLon = pob_lon != null ? Number(pob_lon) : (user?.pob_lon ?? null);

    // dob can be ISO string ("YYYY-MM-DD") from form, or a Date from User
    const dobRaw = dob || user?.dob;
    if (!finalName || !dobRaw || !finalPob || finalLat == null || finalLon == null) {
      return res.status(400).json({
        error: 'Missing required fields: name, dob, pob (with lat/lon).',
        missing: {
          name: !finalName, dob: !dobRaw, pob: !finalPob,
          pob_lat: finalLat == null, pob_lon: finalLon == null,
        },
      });
    }

    const dobDate = dobRaw instanceof Date ? dobRaw : new Date(dobRaw);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dob' });
    }
    const day = dobDate.getUTCDate();
    const month = dobDate.getUTCMonth() + 1;
    const year = dobDate.getUTCFullYear();

    // tob may be "HH:mm" or "Unknown" — default to noon if unknown
    const tobStr = (tob || user?.tob || '').toString();
    let hour = 12, min = 0;
    const tobMatch = tobStr.match(/^(\d{1,2}):(\d{2})/);
    if (tobMatch) { hour = parseInt(tobMatch[1], 10); min = parseInt(tobMatch[2], 10); }

    const payload = {
      source: 'devutsav_web',
      name: finalName,
      day, month, year, hour, min,
      lat: finalLat,
      lon: finalLon,
      tzone: typeof tzone === 'number' ? tzone : 5.5,
      gender: gender || 'male',
      language: language || 'en',
      place: finalPob,
      chart_style: chart_style || 'NORTH_INDIAN',
      footer_link: 'devutsav.com',
      logo_url: 'https://astronext1.s3.ap-south-1.amazonaws.com/logo.svg',
      company_name: 'Devutsav',
      company_info: 'Devutsav',
      domain_url: 'https://devutsav.com',
      company_email: 'hello@devutsav.com',
      company_landline: '+91 00000 00000',
      company_mobile: '+91 00000 00000',
    };

    const upstream = process.env.ASTRONEXT_BASIC_REPORT_URL
      || 'http://65.2.151.121:3000/api/reports/external/basic_report';

    const r = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      return res.status(502).json({ error: 'Upstream basic_report failed', status: r.status, data });
    }

    // Heuristic: find a PDF URL inside response
    const findPdf = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      for (const v of Object.values(obj)) {
        if (typeof v === 'string' && /\.pdf(\?|$)/i.test(v)) return v;
        if (typeof v === 'object') { const f = findPdf(v); if (f) return f; }
      }
      return null;
    };
    const pdf_url = findPdf(data);

    if (user && pdf_url) {
      user.kundali_link = pdf_url;
      await user.save().catch(() => {});
    }

    res.status(200).json({ ok: true, pdf_url, data });
  } catch (err) {
    console.error('basic-report error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
