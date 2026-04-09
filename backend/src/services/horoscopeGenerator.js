import { ChatBedrockConverse } from "@langchain/aws";
import HoroscopeDetail from '../models/HoroscopeDetail.js';

const ZODIACS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

export const generateAndStoreHoroscopes = async (type) => {
    console.log(`Starting ${type} horoscope generation...`);
    
    const llm = new ChatBedrockConverse({
        model: process.env.BEDROCK_HOROSCOPE_MODEL || "anthropic.claude-3-haiku-20240307-v1:0",
        temperature: 0.8,
        region: process.env.AWS_REGION || "ap-south-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    const today = new Date();
    // Format helpers
    const dateStr = today.toISOString().split('T')[0];
    
    // For weekly, get monday
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    const weekStartStr = monday.toISOString().split('T')[0];
    
    // For monthly
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    for (const zodiac of ZODIACS) {
        const prompt = `Generate a ${type} horoscope for ${zodiac} in Hindi.

Tone guidelines:
- Deeply Emotional + deeply spiritual.
- Focus strictly on typical human problems (career, money, relationship, or secret enemies).
- Conclude by offering exactly 1 subtle, practical spiritual remedy (e.g., a specific mantra or simple puja suggestion).
- Keep length STRICTLY between 80–120 words.
- Make it feel highly personal and empathetic, absolutely not generic.
- Provide only the Hindi content. No english translation, no quotes, no extra text.`;

        try {
            const response = await llm.invoke(prompt);
            let content_hindi = response.content;
            if (Array.isArray(content_hindi)) content_hindi = content_hindi[0].text; // Handles Langchain base content blocks

            const docData = {
                zodiac,
                type,
                content_hindi,
                content_english: ''
            };
            
            if (type === 'daily') docData.date = dateStr;
            else if (type === 'weekly') docData.week_start = weekStartStr;
            else if (type === 'monthly') docData.month = monthStr;
            
            // Upsert (prevent dupes)
            const query = { zodiac, type };
            if (type === 'daily') query.date = dateStr;
            else if (type === 'weekly') query.week_start = weekStartStr;
            else if (type === 'monthly') query.month = monthStr;
            
            await HoroscopeDetail.findOneAndUpdate(
                query,
                { $set: docData },
                { upsert: true, new: true }
            );
            
            console.log(`Successfully generated ${type} for ${zodiac}`);
        } catch (error) {
            console.error(`Failed to generate ${type} for ${zodiac}:`, error);
        }
    }
    
    console.log(`Completed ${type} horoscope generation for all 12 zodiacs.`);
};
