import mongoose from 'mongoose';

// Mirror of the agent's file-based tickets (tickets/tickets.jsonl), kept in sync by the
// local agent so the admin panel can show the Healer's queue. `id` is the agent's own ticket id.
const agentTicketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    signature: { type: String, index: true },
    title: { type: String },
    category: { type: String },
    priority: { type: String, index: true },
    status: { type: String, index: true },
    source_agent: { type: String },
    source_run_id: { type: String },
    failed_step: { type: String },
    error: { type: String },
    evidence: { type: mongoose.Schema.Types.Mixed },
    occurrences: { type: Number, default: 1 },
    first_seen: { type: String },
    last_seen: { type: String, index: true },
    fix_attempts: { type: Number, default: 0 },
    commit_sha: { type: String, default: null },
    pushed: { type: Boolean, default: false },
    resolution: { type: String, default: null },
    history: { type: mongoose.Schema.Types.Mixed, default: [] },
    synced_at: { type: Date, default: Date.now },
  },
  { collection: 'agent_tickets', timestamps: false }
);

export default mongoose.models.AgentTicket || mongoose.model('AgentTicket', agentTicketSchema);
