// Admin API for the agent control panel (/admin/agents).
//
// Read endpoints surface what the local agents have synced into MongoDB (runs, tickets,
// heartbeat). The POST endpoint enqueues a command that the local agent runner picks up.
// All routes require the same ADMIN_API_TOKEN bearer used by the rest of the admin panel.
import express from 'express';
import AgentRun from '../models/AgentRun.js';
import AgentTicket from '../models/AgentTicket.js';
import AgentCommand from '../models/AgentCommand.js';
import AgentHeartbeat from '../models/AgentHeartbeat.js';

const router = express.Router();

const AGENTS = ['writer', 'healer', 'audit', 'analytics'];
const RUNNER_ONLINE_MS = 90 * 1000; // heartbeat fresher than this => runner online

function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'ADMIN_API_TOKEN not configured' });
    }
    return next();
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (req.query.token || '');
  if (token !== expected) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.use(requireAdminToken);

// Aggregated status: per-agent summary + runner liveness + queue depth.
router.get('/status', async (_req, res) => {
  try {
    const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const [hb, openTickets, queued, perAgent] = await Promise.all([
      AgentHeartbeat.findOne({ name: 'runner' }).lean(),
      AgentTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      AgentCommand.countDocuments({ status: { $in: ['queued', 'running'] } }),
      Promise.all(
        AGENTS.map(async (agent) => {
          const [last, runs7d, ok7d, err7d, openT] = await Promise.all([
            AgentRun.findOne({ agent }).sort({ ts: -1 }).lean(),
            AgentRun.countDocuments({ agent, ts: { $gte: since7d } }),
            AgentRun.countDocuments({ agent, ts: { $gte: since7d }, status: 'success' }),
            AgentRun.countDocuments({ agent, ts: { $gte: since7d }, status: 'error' }),
            AgentTicket.countDocuments({ source_agent: agent, status: { $in: ['open', 'in_progress'] } }),
          ]);
          return {
            agent,
            last_run_at: last?.ts || null,
            last_status: last?.status || null,
            last_run_id: last?.run_id || null,
            last_duration_ms: last?.duration_ms ?? null,
            last_failed_step: last?.failed_step || null,
            runs_7d: runs7d,
            success_7d: ok7d,
            error_7d: err7d,
            open_tickets: openT,
          };
        })
      ),
    ]);

    const runnerOnline = !!hb && Date.now() - new Date(hb.last_seen).getTime() < RUNNER_ONLINE_MS;
    res.json({
      now: new Date().toISOString(),
      runner: { online: runnerOnline, last_seen: hb?.last_seen || null, info: hb?.info || {} },
      open_tickets: openTickets,
      queued_commands: queued,
      agents: perAgent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent runs (optionally filtered by agent).
router.get('/runs', async (req, res) => {
  try {
    const q = {};
    if (req.query.agent && AGENTS.includes(req.query.agent)) q.agent = req.query.agent;
    const limit = Math.min(Number(req.query.limit) || 30, 200);
    const runs = await AgentRun.find(q).sort({ ts: -1 }).limit(limit).lean();
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tickets (the Healer's queue). Default to active ones.
router.get('/tickets', async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const limit = Math.min(Number(req.query.limit) || 50, 300);
    const tickets = await AgentTicket.find(q).sort({ last_seen: -1 }).limit(limit).lean();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Command history (queue + past runs).
router.get('/commands', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 200);
    const commands = await AgentCommand.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(commands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enqueue a command for the local runner ("talk to an agent").
router.post('/commands', async (req, res) => {
  try {
    const { agent, prompt, options } = req.body || {};
    if (!AGENTS.includes(agent)) {
      return res.status(400).json({ error: `agent must be one of: ${AGENTS.join(', ')}` });
    }
    if (agent === 'writer' && !String(prompt || '').trim()) {
      return res.status(400).json({ error: 'A prompt/topic is required for the writer.' });
    }
    const cmd = await AgentCommand.create({
      agent,
      prompt: String(prompt || '').trim(),
      options: options && typeof options === 'object' ? options : {},
      status: 'queued',
      created_by: 'admin',
    });
    res.status(201).json(cmd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a still-queued command.
router.post('/commands/:id/cancel', async (req, res) => {
  try {
    const cmd = await AgentCommand.findOneAndUpdate(
      { _id: req.params.id, status: 'queued' },
      { status: 'canceled', ended_at: new Date() },
      { new: true }
    );
    if (!cmd) return res.status(409).json({ error: 'Command is not queued (already running or finished).' });
    res.json(cmd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
