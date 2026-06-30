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
import OrchestratorChat from '../models/OrchestratorChat.js';
import AgentMemory from '../models/AgentMemory.js';

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

// ── Orchestrator chat ──────────────────────────────────────────────────────
// Multi-turn natural-language control. The admin chats; the orchestrator (run on the local
// runner) proposes a plan of agent runs; the admin approves steps, which enqueue real commands.

// Queue an orchestrator planning job for the runner to pick up.
async function queuePlanningTurn(chatId) {
  return AgentCommand.create({
    agent: 'orchestrator',
    prompt: 'plan next turn',
    chat_id: chatId,
    status: 'queued',
    created_by: 'admin',
  });
}

// Per-goal autonomy settings from the request body. auto defaults on; the cap is clamped to a
// sane range so a typo can't unleash 1000 runs.
function goalOpts(body) {
  const auto = body?.auto !== false;
  let max = Number(body?.max_steps);
  if (!Number.isFinite(max) || max < 1) max = 8;
  return { auto, max_steps: Math.min(Math.floor(max), 30) };
}

// List chats (newest first), with a light summary for the sidebar.
router.get('/chats', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const chats = await OrchestratorChat.find({ status: 'open' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title thinking messages updatedAt createdAt')
      .lean();
    res.json(
      chats.map((c) => ({
        _id: c._id,
        title: c.title,
        thinking: c.thinking,
        message_count: c.messages?.length || 0,
        last: c.messages?.length ? c.messages[c.messages.length - 1].content?.slice(0, 80) : '',
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full chat with all messages + plans.
router.get('/chats/:id', async (req, res) => {
  try {
    const chat = await OrchestratorChat.findById(req.params.id).lean();
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a chat, optionally seeding the first user message (which kicks off the goal loop).
router.post('/chats', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const { auto, max_steps } = goalOpts(req.body);
    const chat = await OrchestratorChat.create({
      title: message ? message.slice(0, 60) : 'New chat',
      messages: message ? [{ role: 'user', content: message }] : [],
      thinking: !!message,
      auto,
      max_steps,
      steps_used: 0,
      goal_status: message && auto ? 'running' : 'idle',
      created_by: 'admin',
    });
    if (message) await queuePlanningTurn(chat._id);
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message in an existing chat → starts a NEW goal: reset the step budget and re-plan.
router.post('/chats/:id/messages', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'message is required' });
    const chat = await OrchestratorChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    if (chat.thinking) return res.status(409).json({ error: 'orchestrator is still replying — wait for it' });
    const { auto, max_steps } = goalOpts(req.body);
    chat.messages.push({ role: 'user', content: message });
    chat.thinking = true;
    chat.auto = auto;
    chat.max_steps = max_steps;
    chat.steps_used = 0; // a new instruction is a new goal → fresh budget
    chat.goal_status = auto ? 'running' : 'idle';
    await chat.save();
    await queuePlanningTurn(chat._id);
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pause a running goal: the loop stops re-planning after the current in-flight step.
router.post('/chats/:id/pause', async (req, res) => {
  try {
    const chat = await OrchestratorChat.findByIdAndUpdate(
      req.params.id,
      { goal_status: 'paused' },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resume a paused goal: re-arm the loop and queue a fresh planning turn.
router.post('/chats/:id/resume', async (req, res) => {
  try {
    const chat = await OrchestratorChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    if (chat.thinking) return res.status(409).json({ error: 'orchestrator is still working' });
    const { max_steps } = goalOpts({ max_steps: req.body?.max_steps ?? chat.max_steps });
    chat.auto = true;
    chat.max_steps = max_steps;
    chat.goal_status = 'running';
    chat.thinking = true;
    await chat.save();
    await queuePlanningTurn(chat._id);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve proposed step(s) → enqueue the real agent command(s). Body: { message_id, step_id? }.
// With step_id, runs that one step; without, runs every still-proposed step in the message (in order).
router.post('/chats/:id/approve', async (req, res) => {
  try {
    const { message_id, step_id } = req.body || {};
    const chat = await OrchestratorChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'chat not found' });
    const msg = chat.messages.id(message_id);
    if (!msg || !msg.plan?.length) return res.status(404).json({ error: 'no plan on that message' });

    const steps = step_id ? [msg.plan.id(step_id)].filter(Boolean) : msg.plan.filter((s) => s.status === 'proposed');
    if (!steps.length) return res.status(409).json({ error: 'nothing to approve' });

    for (const step of steps) {
      if (step.status !== 'proposed') continue;
      if (step.agent === 'writer' && !String(step.prompt || '').trim()) {
        step.status = 'error';
        continue; // writer must have a topic; skip rather than queue a guaranteed failure
      }
      const cmd = await AgentCommand.create({
        agent: step.agent,
        prompt: String(step.prompt || '').trim(),
        options: step.options && typeof step.options === 'object' ? step.options : {},
        chat_id: chat._id,
        status: 'queued',
        created_by: 'orchestrator',
      });
      step.status = 'queued';
      step.command_id = cmd._id;
    }
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Persistent memory ──────────────────────────────────────────────────────
// Shared facts/preferences/learnings the agents read every run. The orchestrator writes here
// automatically (source 'orchestrator'); the admin curates by hand here (source 'admin').
const MEMORY_SCOPES = ['global', 'orchestrator', 'writer', 'healer', 'audit', 'analytics'];

// List memory, newest-pinned first, optionally filtered by scope.
router.get('/memory', async (req, res) => {
  try {
    const q = {};
    if (req.query.scope && MEMORY_SCOPES.includes(req.query.scope)) q.scope = req.query.scope;
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const mem = await AgentMemory.find(q).sort({ pinned: -1, updatedAt: -1 }).limit(limit).lean();
    res.json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert a memory entry by (scope, key). Body: { scope, key, content, pinned? }.
router.post('/memory', async (req, res) => {
  try {
    const scope = MEMORY_SCOPES.includes(req.body?.scope) ? req.body.scope : 'global';
    const key = String(req.body?.key || '').trim().slice(0, 80);
    const content = String(req.body?.content || '').trim().slice(0, 1000);
    if (!key || !content) return res.status(400).json({ error: 'key and content are required' });
    const mem = await AgentMemory.findOneAndUpdate(
      { scope, key },
      { $set: { content, pinned: !!req.body?.pinned, source: 'admin' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle pin / edit an existing entry by id.
router.patch('/memory/:id', async (req, res) => {
  try {
    const set = {};
    if (typeof req.body?.pinned === 'boolean') set.pinned = req.body.pinned;
    if (typeof req.body?.content === 'string') set.content = req.body.content.trim().slice(0, 1000);
    const mem = await AgentMemory.findByIdAndUpdate(req.params.id, { $set: set }, { new: true });
    if (!mem) return res.status(404).json({ error: 'not found' });
    res.json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forget an entry.
router.delete('/memory/:id', async (req, res) => {
  try {
    const r = await AgentMemory.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
