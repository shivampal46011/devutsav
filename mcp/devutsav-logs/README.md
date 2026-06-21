# devutsav-logs MCP

An MCP server that exposes DevUtsav's centralized logs so an MCP client (Claude Code, Claude
Desktop, etc.) can read and slice them to **find and fix problems**.

It reads the `server_logs` capped collection in MongoDB — the same store the admin **LOGS** page
uses. Every log carries `service`, `source`, `level`, `timestamp`, and (where relevant) HTTP
`method`/`route`/`status`/`duration_ms`, `session_id`, `ip`, `stack`, and arbitrary `meta`.

Sources:
- `server` — backend app logs (winston): services `api`, `devpunya`, `llm`
- `http` — one structured row per API request (method, route, status, duration)
- `client` — browser-side network failures, slow fetches, and uncaught JS errors (service `web`)
- `agent` — the writer/healer/audit agents

## Tools

| Tool | What it does |
|------|--------------|
| `query_logs` | Filter by service, source, level, status, route, free-text `search`, and `since`/`until` (ISO or relative like `30m`/`2h`/`1d`). Newest first. |
| `recent_errors` | Most recent error-level logs + HTTP 5xx — "what's broken right now". |
| `log_stats` | Counts by level and by service over a window. |
| `log_services` | Distinct service + source names (use before filtering). |

## Setup

```bash
cd mcp/devutsav-logs
npm install
```

Set the connection string (same `MONGO_URI` as the backend/agent):

```bash
export MONGO_URI="mongodb+srv://...@.../devutsav"
# optional: export MONGO_DB="devutsav"
```

### Register with Claude Code

```bash
claude mcp add devutsav-logs -e MONGO_URI="mongodb+srv://...@.../devutsav" -- node /Users/shivampal/Desktop/devutsav/mcp/devutsav-logs/index.js
```

Or add to your MCP config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "devutsav-logs": {
      "command": "node",
      "args": ["/Users/shivampal/Desktop/devutsav/mcp/devutsav-logs/index.js"],
      "env": { "MONGO_URI": "mongodb+srv://...@.../devutsav" }
    }
  }
}
```

## Example asks

- "Use devutsav-logs: any errors in the last 30 minutes?"
- "query_logs for service=api, status=500, since=2h — what's the stack?"
- "Show client logs where the message contains 'fetch failed' in the last day."
