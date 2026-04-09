import express from 'express';
import Blog from '../models/Blog.js';
import PromptSchedule from '../models/PromptSchedule.js';
import generateBlogContent from '../services/blogGenerator.js';

const router = express.Router();

// --- Blogs ---

// Get all blogs (Admin Panel view)
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update or publish a blog
router.put('/blogs/:id', async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually trigger a blog generation from a prompt string
router.post('/blogs/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await generateBlogContent(prompt);
    
    // Extract a makeshift title (e.g. from the first #)
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : 'Generated Blog Post';

    const newBlog = new Blog({
      title,
      content_md: content,
      status: 'DRAFT'
    });
    
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Schedules ---

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await PromptSchedule.find().sort({ createdAt: -1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new schedule
router.post('/schedules', async (req, res) => {
  try {
    const newSchedule = new PromptSchedule(req.body);
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle or update schedule
router.put('/schedules/:id', async (req, res) => {
    try {
      const schedule = await PromptSchedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(schedule);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

export default router;
