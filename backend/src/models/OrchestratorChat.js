import mongoose from 'mongoose';

// A multi-turn conversation with the Orchestrator agent.
//
// The admin panel talks to the orchestrator in natural language. Each turn:
//   1. the panel appends a `user` message and queues an `orchestrator` AgentCommand (chat_id set);
//   2. the local runner picks it up, feeds the whole transcript + agent catalog to Claude, and
//      appends an `assistant` message — text reply plus an optional PROPOSED plan (steps);
//   3. the panel renders the steps with Run buttons. Approving a step enqueues a real agent
//      command (writer/healer/audit/analytics) and flips the step's status from `proposed`.
//
// The orchestrator never runs agents itself — it only proposes. Execution is always user-approved.
const planStepSchema = new mongoose.Schema(
  {
    agent: { type: String, enum: ['writer', 'healer', 'audit', 'analytics'], required: true },
    prompt: { type: String, default: '' },
    options: { type: mongoose.Schema.Types.Mixed, default: {} },
    why: { type: String, default: '' }, // one-line rationale shown to the admin
    status: {
      type: String,
      enum: ['proposed', 'queued', 'running', 'done', 'error', 'skipped'],
      default: 'proposed',
    },
    command_id: { type: mongoose.Schema.Types.ObjectId, default: null }, // the spawned AgentCommand
  },
  { _id: true }
);

const messageSchema = new mongoose.Schema(
  {
    // 'system' messages carry an agent's RESULT back into the transcript, so the next
    // orchestrator turn can see what happened and compose the following step from it.
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, default: '' },
    plan: { type: [planStepSchema], default: undefined }, // present on assistant turns that propose actions
    error: { type: String, default: null }, // set if the planning turn failed
    ts: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orchestratorChatSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New chat' },
    messages: { type: [messageSchema], default: [] },
    status: { type: String, enum: ['open', 'archived'], default: 'open', index: true },
    // True while a queued/running orchestrator command is generating the next assistant turn.
    thinking: { type: Boolean, default: false },
    // Reactive-loop control. When auto is on, the orchestrator runs the goal itself: propose →
    // run → feed result back → re-plan, until it finishes, hits max_steps, or is paused.
    auto: { type: Boolean, default: true },
    max_steps: { type: Number, default: 8 }, // hard cap on agent runs per goal
    steps_used: { type: Number, default: 0 }, // agent runs executed toward the current goal
    goal_status: { type: String, enum: ['idle', 'running', 'paused', 'done', 'capped'], default: 'idle' },
    created_by: { type: String, default: 'admin' },
  },
  { collection: 'orchestrator_chats', timestamps: true }
);

orchestratorChatSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.models.OrchestratorChat || mongoose.model('OrchestratorChat', orchestratorChatSchema);
