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
import agentRoutes from './routes/agentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import horoscopeRoutes from './routes/horoscopeRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import kundaliRoutes from './routes/kundaliRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import guidanceRoutes from './routes/guidanceRoutes.js';
import cron from 'node-cron';
import PromptSchedule from './models/PromptSchedule.js';
import Blog from './models/Blog.js';
import generateBlogContent from './services/blogGenerator.js';
import { generateAndStoreHoroscopes } from './services/horoscopeGenerator.js';
import { generateTodaysTip } from './services/dailyTipGenerator.js';
import { logger } from './utils/logger.js';
import { runWithSchedule } from './utils/runWithSchedule.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allowlist driven by CORS_ALLOWED_ORIGINS (comma-separated).
// Empty / unset ⇒ allow all (dev convenience). Always allow same-origin / curl (no Origin header).
const corsAllowList = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (corsAllowList.length === 0) return cb(null, true);
      if (corsAllowList.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
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
app.use('/api/admin/agents', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/kundali', kundaliRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/guidance', guidanceRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'DevUtsav API is running' });
});

// Cron Job for Auto Content Bot
const blogBotExpr = '0 0 * * *';
cron.schedule(blogBotExpr, runWithSchedule('blog_bot_daily', blogBotExpr, async () => {
  console.log(`[CRON] ${new Date().toISOString()} - Running Auto Content Bot (Daily Mode)...`);
  let count = 0;
  const activeSchedules = await PromptSchedule.find({ is_active: true });
  console.log(`[CRON] Found ${activeSchedules.length} active schedules matching is_active:true.`);

  for (const schedule of activeSchedules) {
    const t0 = Date.now();
    try {
      console.log(`[CRON] Generating content via AI for schedule id: ${schedule._id}...`);
      const content = await generateBlogContent(schedule.prompt_text);
      const titleMatch = content.match(/^#\s+(.*)/m);
      const title = titleMatch ? titleMatch[1] : 'Daily Spiritual Insight';
      const newBlog = new Blog({
        title, content_md: content, status: 'PUBLISHED', excerpt: title, schedule_id: schedule._id,
      });
      await newBlog.save();
      schedule.last_run_at = new Date();
      schedule.last_status = 'success';
      schedule.last_error = '';
      schedule.last_duration_ms = Date.now() - t0;
      await schedule.save();
      count++;
      console.log(`[CRON] Blog "${title}" successfully saved.`);
    } catch (err) {
      schedule.last_run_at = new Date();
      schedule.last_status = 'error';
      schedule.last_error = String(err?.message || err);
      schedule.last_duration_ms = Date.now() - t0;
      await schedule.save();
      console.error(`[CRON] Schedule ${schedule._id} failed:`, err);
    }
  }
  return count;
}));

// Horoscope Automation Backend Cron Jobs
const dailyExpr = '5 0 * * *';
cron.schedule(dailyExpr, runWithSchedule('horoscope_daily', dailyExpr, async () => {
  console.log('Running daily horoscopes generation at 12:05 AM...');
  await generateAndStoreHoroscopes('daily');
}));
const weeklyExpr = '15 0 * * 1';
cron.schedule(weeklyExpr, runWithSchedule('horoscope_weekly', weeklyExpr, async () => {
  console.log('Running weekly horoscopes generation at 12:15 AM...');
  await generateAndStoreHoroscopes('weekly');
}));
const monthlyExpr = '30 0 1 * *';
cron.schedule(monthlyExpr, runWithSchedule('horoscope_monthly', monthlyExpr, async () => {
  console.log('Running monthly horoscopes generation at 12:30 AM...');
  await generateAndStoreHoroscopes('monthly');
}));

// Daily Guidance tip — runs at 12:10 AM. Idempotent so safe to re-run.
const tipExpr = '10 0 * * *';
cron.schedule(tipExpr, runWithSchedule('daily_guidance_tip', tipExpr, async () => {
  console.log('Generating daily guidance tip...');
  const tip = await generateTodaysTip({ force: true });
  console.log(`[CRON] Daily tip: "${tip.title}" (${tip.status})`);
  return 1;
}));

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
