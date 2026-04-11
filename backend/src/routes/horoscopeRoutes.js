import express from 'express';
import HoroscopeDetail from '../models/HoroscopeDetail.js';

const router = express.Router();

const getHoroscope = async (req, res, type) => {
    try {
        const sign = req.query.sign?.toLowerCase();
        if (!sign) {
            return res.status(400).json({ error: 'Zodiac ?sign= is required' });
        }
        
        const query = { zodiac: sign, type };
        
        // Find the absolute latest available horoscope for that type
        const horoscope = await HoroscopeDetail.findOne(query).sort({ created_at: -1 });
        
        if (!horoscope) {
            return res.status(404).json({ error: `No ${type} horoscope currently generated for ${sign}` });
        }
        
        res.json({
            sign: sign.charAt(0).toUpperCase() + sign.slice(1),
            type,
            content: horoscope.content_hindi
        });
        
    } catch (err) {
        console.error(`Error fetching ${type} horoscope:`, err);
        res.status(500).json({ error: 'Server Error' });
    }
};

router.get('/daily', (req, res) => getHoroscope(req, res, 'daily'));
router.get('/weekly', (req, res) => getHoroscope(req, res, 'weekly'));
router.get('/monthly', (req, res) => getHoroscope(req, res, 'monthly'));

// Fallback dynamic handler for ?zodiac=Aries&timeframe=daily query structure
router.get('/', (req, res) => {
    const sign = req.query.zodiac || req.query.sign;
    const timeframe = req.query.timeframe?.toLowerCase() || 'daily';
    
    if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
        return res.status(400).json({ error: 'Invalid timeframe. Must be daily, weekly, or monthly.' });
    }
    
    req.query.sign = sign; // Normalize back to the internal `sign` variable
    return getHoroscope(req, res, timeframe);
});

export default router;
