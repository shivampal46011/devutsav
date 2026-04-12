import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

import userRoutes from './routes/userRoutes.js';
import intentRoutes from './routes/intentRoutes.js';
import whisperRoutes from './routes/whisperRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import horoscopeRoutes from './routes/horoscopeRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import kundaliRoutes from './routes/kundaliRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import cron from 'node-cron';
import PromptSchedule from './models/PromptSchedule.js';
import Blog from './models/Blog.js';
import generateBlogContent from './services/blogGenerator.js';
import { generateAndStoreHoroscopes } from './services/horoscopeGenerator.js';
import { logger } from './utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devutsav';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/analyzer', intentRoutes);
app.use('/api/whispers', whisperRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/kundali', kundaliRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/location', locationRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'DevUtsav API is running' });
});

// Cron Job for Auto Content Bot
cron.schedule('0 0 * * *', async () => {
  console.log(`[CRON] ${new Date().toISOString()} - Running Auto Content Bot (Daily Mode)...`);
  try {
    const activeSchedules = await PromptSchedule.find({ is_active: true });
    console.log(`[CRON] Found ${activeSchedules.length} active schedules matching is_active:true.`);
    
    for (const schedule of activeSchedules) {
      console.log(`[CRON] Generating content via AI for schedule id: ${schedule._id}...`);
      const content = await generateBlogContent(schedule.prompt_text);
      
      const titleMatch = content.match(/^#\s+(.*)/m);
      const title = titleMatch ? titleMatch[1] : 'Daily Spiritual Insight';
      console.log(`[CRON] Title parsed: "${title}". Saving to DB...`);

      const newBlog = new Blog({
        title,
        content_md: content,
        status: 'PUBLISHED',
        excerpt: title,
        schedule_id: schedule._id,
      });
      await newBlog.save();
      console.log(`[CRON] Blog "${title}" successfully saved to Database!`);
    }
    console.log(`[CRON] Generation queue complete.`);
  } catch (err) {
    console.error('[CRON] Error during generation execution:', err);
  }
});

// Horoscope Automation Backend Cron Jobs
cron.schedule('5 0 * * *', async () => {
    console.log('Running daily horoscopes generation at 12:05 AM...');
    await generateAndStoreHoroscopes('daily');
});

cron.schedule('15 0 * * 1', async () => {
    console.log('Running weekly horoscopes generation at 12:15 AM...');
    await generateAndStoreHoroscopes('weekly');
});

cron.schedule('30 0 1 * *', async () => {
    console.log('Running monthly horoscopes generation at 12:30 AM...');
    await generateAndStoreHoroscopes('monthly');
});

app.listen(PORT, async () => {
  await connectDB();
  try {
    const legacy = await Blog.find({
      $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }],
    });
    for (const b of legacy) {
      await b.save();
    }
    if (legacy.length) {
      logger.info(`Blog slug migration: updated ${legacy.length} document(s).`);
    }
  } catch (e) {
    logger.error('Blog slug migration failed', e);
  }
  console.log(`Server is running on port ${PORT}`);
});
