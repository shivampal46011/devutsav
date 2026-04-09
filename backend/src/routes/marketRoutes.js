import express from 'express';
import { getPujas, getChadhawas, registerUser } from '../services/devpunyaService.js';
import User from '../models/User.js';

const router = express.Router();

// GET all Pujas via Proxy
router.get('/pujas', async (req, res) => {
    try {
        const data = await getPujas(req.query.country_code || 'IN');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pujas from DevPunya' });
    }
});

// GET all Chadhawa via Proxy
router.get('/chadhawas', async (req, res) => {
    try {
        const data = await getChadhawas(req.query.country_code || 'IN');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Chadhawas from DevPunya' });
    }
});

// Auth Route to trigger DevPunya login specifically
router.post('/auth/devpunya', async (req, res) => {
    try {
        const { user_session_id, phone, fullname, email, isdCode } = req.body;
        
        let user = await User.findOne({ user_session_id });
        if (!user && phone) {
             user = await User.findOne({ phone });
             if (user) {
                 user.user_session_id = user_session_id;
                 await user.save();
             }
        }

        if (!user) {
             try {
                 const u = new User({ user_session_id, phone, name: fullname, email });
                 await u.save();
                 user = u;
             } catch (dbErr) {
                 // Fallback if duplicate phone race condition
                 if (dbErr.code === 11000) {
                     user = await User.findOne({ phone });
                 } else {
                     throw dbErr;
                 }
             }
        }
        
        // Return existing DevPunya token if already registered
        if (user.devpunya_token) {
             return res.json({ success: true, token: user.devpunya_token });
        }
        
        // Otherwise, register on DevPunya
        const dpData = await registerUser({ isdCode, phone, fullname, email });
        if (dpData.success && dpData.results?.token) {
             user.devpunya_token = dpData.results.token;
             if (dpData.results.userDetails?.id) {
                 user.devpunya_user_id = dpData.results.userDetails.id;
             }
             await user.save();
             return res.json({ success: true, token: user.devpunya_token });
        }
        
        return res.status(400).json(dpData);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
