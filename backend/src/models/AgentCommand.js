import mongoose from 'mongoose';

// The command queue: the admin panel enqueues a command (e.g. "writer, write about X"),
// the local agent runner polls for `queued` ones, executes the matching CLI run, and writes
// status + result back here. This is the "talk to the agents" channel.
const agentCommandSchema = new mongoose.Schema(
  {
    agent: { type: String, required: true, enum: ['writer', 'healer', 'audit', 'analytics', 'orchestrator'], index: true },
    prompt: { type: String, default: '' },
    options: { type: mongoose.Schema.Types.Mixed, default: {} },
    // For orchestrator planning jobs and approved child runs: the chat this command belongs to.
    chat_id: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'done', 'error', 'canceled'],
      default: 'queued',
      index: true,
    },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    output: { type: String, default: '' },
    run_id: { type: String, default: null },
    created_by: { type: String, default: 'admin' },
    started_at: { type: Date, default: null },
    ended_at: { type: Date, default: null },
  },
  { collection: 'agent_commands', timestamps: true }
);

agentCommandSchema.index({ status: 1, createdAt: 1 });
agentCommandSchema.index({ agent: 1, createdAt: -1 });

export default mongoose.models.AgentCommand || mongoose.model('AgentCommand', agentCommandSchema);
