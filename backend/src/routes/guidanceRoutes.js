import express from 'express';
import DailyTip from '../models/DailyTip.js';
import GuidanceSubscriber from '../models/GuidanceSubscriber.js';
import User from '../models/User.js';
import { generateTodaysTip } from '../services/dailyTipGenerator.js';

const router = express.Router();

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function getOrGenerateToday() {
  let tip = await DailyTip.findOne({ date: todayIso() });
  if (!tip) tip = await generateTodaysTip();
  return tip;
}

/** Today's daily tip — public endpoint, used by already-unlocked clients. */
router.get('/today', async (_req, res) => {
  try {
    const tip = await getOrGenerateToday();
    res.json({
      date: tip.date,
      title: tip.title,
      body: tip.body,
      status: tip.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Submit profile + unlock today's tip. */
router.post('/unlock', async (req, res) => {
  try {
    const {
      name, email, phone, isd_code, pob, dob, tob,
      pob_lat, pob_lon, pob_city, pob_state, pob_country, pob_place_id,
      email_subscribe, user_session_id,
    } = req.body || {};

    const lat = Number.isFinite(Number(pob_lat)) ? Number(pob_lat) : undefined;
    const lon = Number.isFinite(Number(pob_lon)) ? Number(pob_lon) : undefined;
    const placeFields = {
      ...(lat != null ? { pob_lat: lat } : {}),
      ...(lon != null ? { pob_lon: lon } : {}),
      ...(pob_city ? { pob_city: String(pob_city).trim() } : {}),
      ...(pob_state ? { pob_state: String(pob_state).trim() } : {}),
      ...(pob_country ? { pob_country: String(pob_country).trim() } : {}),
      ...(pob_place_id ? { pob_place_id: String(pob_place_id).trim() } : {}),
    };

    const isdClean = (() => {
      const raw = String(isd_code || '+91').trim();
      const digits = raw.replace(/\D/g, '');
      return digits ? `+${digits.slice(0, 4)}` : '+91';
    })();

    if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
    if (!phone || !/^[0-9]{6,15}$/.test(String(phone).replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'valid phone is required' });
    }
    if (!pob || !String(pob).trim()) return res.status(400).json({ error: 'place of birth is required' });

    const phoneClean = String(phone).replace(/\D/g, '');

    // Upsert by phone — same number unlocking again refreshes profile fields.
    const existing = await GuidanceSubscriber.findOne({ phone: phoneClean });
    if (existing) {
      existing.name = String(name).trim();
      if (email) existing.email = String(email).trim();
      existing.isd_code = isdClean;
      existing.pob = String(pob).trim();
      Object.assign(existing, placeFields);
      if (dob) existing.dob = String(dob).trim();
      if (tob) existing.tob = String(tob).trim();
      if (email_subscribe != null) existing.email_subscribe = Boolean(email_subscribe);
      if (user_session_id) existing.user_session_id = String(user_session_id).slice(0, 64);
      await existing.save();
    } else {
      await GuidanceSubscriber.create({
        name: String(name).trim(),
        email: email ? String(email).trim() : undefined,
        isd_code: isdClean,
        phone: phoneClean,
        pob: String(pob).trim(),
        ...placeFields,
        dob: dob ? String(dob).trim() : undefined,
        tob: tob ? String(tob).trim() : undefined,
        email_subscribe: Boolean(email_subscribe),
        user_session_id: user_session_id ? String(user_session_id).slice(0, 64) : undefined,
      });
    }

    // Upsert User profile so this person is treated as logged-in across the site.
    let user = await User.findOne({ phone: phoneClean });
    if (!user && email) user = await User.findOne({ email: String(email).trim().toLowerCase() });
    const userPayload = {
      name: String(name).trim(),
      phone: phoneClean,
      isd_code: isdClean,
      pob: String(pob).trim(),
      ...placeFields,
      ...(email ? { email: String(email).trim().toLowerCase() } : {}),
      ...(dob ? { dob: new Date(String(dob)) } : {}),
      ...(tob ? { tob: String(tob).trim() } : {}),
      ...(user_session_id ? { user_session_id: String(user_session_id).slice(0, 64) } : {}),
    };
    if (user) {
      Object.assign(user, userPayload);
      await user.save();
    } else {
      user = await User.create(userPayload);
    }

    const tip = await getOrGenerateToday();
    res.json({
      ok: true,
      date: tip.date,
      title: tip.title,
      body: tip.body,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isd_code: user.isd_code,
      },
    });
  } catch (err) {
    console.error('guidance unlock error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
