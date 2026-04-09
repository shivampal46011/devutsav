import { generateAndStoreHoroscopes } from '../services/horoscopeGenerator.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '../.env' }); // load from backend root

const run = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devutsav';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully for manual seeding');

        console.log('Force starting horoscope generation natively via AWS Bedrock...');
        await generateAndStoreHoroscopes('daily');
        await generateAndStoreHoroscopes('weekly');
        await generateAndStoreHoroscopes('monthly');
        
        console.log('Manual seeding completed! The API will now serve data correctly.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

run();
