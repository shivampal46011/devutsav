import mongoose from 'mongoose';

// Operator-authored instructions (markdown) that override an agent's built-in behavior.
//
// One document per scope: 'global' applies to every agent; an agent name (writer/healer/audit/
// analytics/orchestrator) applies to just that agent. When enabled, the content is injected into
// the agent's Claude call as an AUTHORITATIVE system prompt that supersedes the defaults — so you
// can fully retune tone, rules, persona, or process by editing markdown in the admin panel.
const agentInstructionSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ['global', 'orchestrator', 'writer', 'healer', 'audit', 'analytics'],
      required: true,
      unique: true,
    },
    content: { type: String, default: '' }, // markdown
    enabled: { type: Boolean, default: true },
    updated_by: { type: String, default: 'admin' },
  },
  { collection: 'agent_instructions', timestamps: true }
);

export default mongoose.models.AgentInstruction || mongoose.model('AgentInstruction', agentInstructionSchema);
