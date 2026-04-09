import express from 'express';

const router = express.Router();
// Hardcoded based on user instruction. It's best practice to put this in process.env, but falling back intentionally.
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDC6ucURbOHq9MEpYz079v1N23ggsm7wdM';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

router.get('/autocomplete', async (req, res) => {
    try {
        const { input, sessiontoken } = req.query;
        if (!input) return res.json([]);
        
        const url = `${BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&sessiontoken=${sessiontoken}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
            const suggestions = (data.predictions || []).map(p => ({
                description: p.description,
                place_id: p.place_id
            }));
            return res.json(suggestions);
        }
        return res.status(400).json({ error: data.error_message || 'API Error' });
    } catch (err) {
        console.error('Google Autocomplete Proxy Error:', err);
        return res.status(500).json({ error: 'Failed to fetch autocomplete' });
    }
});

router.get('/details', async (req, res) => {
    try {
        const { place_id, sessiontoken } = req.query;
        if (!place_id) return res.status(400).json({ error: 'place_id required' });
        
        const url = `${BASE_URL}/details/json?place_id=${place_id}&fields=geometry,address_components&sessiontoken=${sessiontoken}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK') {
            const result = data.result;
            const components = result.address_components || [];
            
            let city = '';
            let state = '';
            let country = '';
            
            for (const comp of components) {
                if (comp.types.includes('locality')) {
                    city = comp.long_name;
                } else if (!city && (comp.types.includes('administrative_area_level_2') || comp.types.includes('postal_town'))) {
                    city = comp.long_name;
                } else if (comp.types.includes('administrative_area_level_1')) {
                    state = comp.long_name;
                } else if (comp.types.includes('country')) {
                    country = comp.long_name;
                }
            }
            
            return res.json({
                lat: result.geometry?.location?.lat,
                lng: result.geometry?.location?.lng,
                city,
                state,
                country
            });
        }
        return res.status(400).json({ error: data.error_message || 'Failed to fetch details' });
    } catch (err) {
        console.error('Google Place Details Proxy Error:', err);
        return res.status(500).json({ error: 'Failed to fetch details' });
    }
});

export default router;
