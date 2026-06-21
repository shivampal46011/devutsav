import mongoose from 'mongoose';

// Central, queryable log store for the whole platform: backend app logs, HTTP access logs,
// browser network/JS-error logs, and agent logs all land here so the admin panel and the
// devutsav-logs MCP can read + slice them. Stored in a CAPPED collection so it self-trims
// (oldest documents are evicted) and never needs manual cleanup.
//
// Logs are insert-only (never updated), which is exactly what capped collections require.
const serverLogSchema = new mongoose.Schema(
  {
    ts: { type: Date, default: Date.now, index: true },
    // Where it came from: server (app log) | http (access log) | client (browser) | agent.
    source: { type: String, default: 'server', index: true },
    // Logical service/component, e.g. api, devpunya, llm, web, writer, healer, kundali.
    service: { type: String, default: 'api', index: true },
    level: { type: String, default: 'info', index: true }, // debug | info | warn | error
    message: { type: String, default: '' },

    // HTTP context (set for access logs and client network logs).
    method: { type: String },
    route: { type: String, index: true },
    status: { type: Number, index: true },
    duration_ms: { type: Number },

    // Correlation / origin.
    request_id: { type: String },
    session_id: { type: String },
    ip: { type: String },
    ua: { type: String },

    stack: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  {
    collection: 'server_logs',
    timestamps: false,
    // ~200 MB ring buffer; oldest entries are evicted automatically.
    capped: { size: 200 * 1024 * 1024, max: 500000 },
  }
);

serverLogSchema.index({ service: 1, ts: -1 });
serverLogSchema.index({ level: 1, ts: -1 });

export default mongoose.models.ServerLog || mongoose.model('ServerLog', serverLogSchema);
