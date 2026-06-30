import mongoose from 'mongoose';

// Persistent, shared memory for the agent fleet. One small fact per entry, so the agents can
// work WITH accumulated context instead of starting blank every run.
//
//   scope  — 'global' (every agent reads it) or a specific agent name (writer/healer/audit/
//            analytics/orchestrator) for facts only that agent needs. The orchestrator reads all.
//   key    — a short stable identifier; (scope, key) is unique so writing the same key updates it.
//   content— the fact / preference / learning itself.
//
// Written two ways: the orchestrator records learnings automatically (source 'orchestrator'),
// and the admin curates entries by hand in the panel (source 'admin'). Agents only READ.
const agentMemorySchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ['global', 'orchestrator', 'writer', 'healer', 'audit', 'analytics'],
      default: 'global',
      index: true,
    },
    key: { type: String, required: true },
    content: { type: String, required: true },
    pinned: { type: Boolean, default: false }, // pinned entries sort first and survive trimming
    source: { type: String, enum: ['admin', 'orchestrator'], default: 'admin' },
    tags: { type: [String], default: [] },
  },
  { collection: 'agent_memory', timestamps: true }
);

agentMemorySchema.index({ scope: 1, key: 1 }, { unique: true });
agentMemorySchema.index({ scope: 1, pinned: -1, updatedAt: -1 });

export default mongoose.models.AgentMemory || mongoose.model('AgentMemory', agentMemorySchema);
