import mongoose from 'mongoose';

// Liveness beacon for the local agent runner. The runner upserts `last_seen` on a short
// interval; the panel uses it to show whether the runner (the thing that executes queued
// commands) is currently online.
const agentHeartbeatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    last_seen: { type: Date, default: Date.now },
    info: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { collection: 'agent_heartbeats', timestamps: false }
);

export default mongoose.models.AgentHeartbeat || mongoose.model('AgentHeartbeat', agentHeartbeatSchema);
