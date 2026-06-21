import mongoose from 'mongoose';

// One document per finished agent run. Mirrors the agent's logs/runs.jsonl line.
// Written by the local agent (sync.js), read by the admin panel via the backend.
const agentRunSchema = new mongoose.Schema(
  {
    run_id: { type: String, required: true, unique: true, index: true },
    agent: { type: String, required: true, index: true },
    mode: { type: String },
    status: { type: String, enum: ['running', 'success', 'error', 'warn'], index: true },
    duration_ms: { type: Number },
    failed_step: { type: String, default: null },
    error: { type: String },
    steps: { type: mongoose.Schema.Types.Mixed, default: [] },
    result: { type: mongoose.Schema.Types.Mixed, default: {} },
    ts: { type: Date, default: Date.now, index: true },
  },
  { collection: 'agent_runs', timestamps: false }
);

agentRunSchema.index({ agent: 1, ts: -1 });

export default mongoose.models.AgentRun || mongoose.model('AgentRun', agentRunSchema);
