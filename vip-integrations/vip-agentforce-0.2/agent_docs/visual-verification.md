# Visual Verification

## REST API

Namespace: `vip-agentforce/v1`

```bash
# Most endpoints require authentication (unauthenticated requests will 403).
# Use wp eval to make authenticated REST calls locally:
#
vip dev-env exec --slug=vip-agentforce -- wp eval "
wp_set_current_user(1);
\$request = new WP_REST_Request('GET', '/vip-agentforce/v1/sync-progress');
\$response = rest_do_request(\$request);
echo json_encode(\$response->get_data(), JSON_PRETTY_PRINT);
" --user=1
```

## Browser Automation

Use browser automation to navigate to the dev site and visually verify UI
changes. Pick a tool based on where the agent is running, not which one looks
prettiest — they all do roughly the same job (navigate, screenshot, read DOM,
inspect console + network).

### On a local machine — pick whichever MCP is connected

These attach to a real browser the developer is already running, so they're
fastest for "open the dev site and tell me what's broken" loops:

- **Chrome DevTools MCP** (`mcp__chrome-devtools__*`) — model-agnostic, talks
  to Chrome DevTools Protocol directly. Works with any agent that loads MCP.
- **Firefox MCP** (`mcp__firefox__*`) — model-agnostic Firefox equivalent.
  Useful when verifying CMP widget rendering across engines.
- **Claude Chrome integration** (`mcp__claude-in-chrome__*`) — Claude-specific
  shortcut to a Chrome session. Same surface as Chrome DevTools MCP plus a
  few Claude-tuned helpers:
  - `mcp__claude-in-chrome__navigate` — open a URL
  - `mcp__claude-in-chrome__read_page` — read rendered page content
  - `mcp__claude-in-chrome__find` — locate elements on page
  - `mcp__claude-in-chrome__computer` — take screenshots, click, interact
  - `mcp__claude-in-chrome__read_console_messages` — JS console errors
  - `mcp__claude-in-chrome__read_network_requests` — network traffic (API
    calls, failed loads)

If more than one is available, prefer Chrome DevTools MCP / Firefox MCP — they
keep the doc model-agnostic. Reach for `mcp__claude-in-chrome__*` only when a
specific helper above doesn't have a clean DevTools-MCP equivalent.

### In an isolated environment — use agent-browser

When there's no developer browser to attach to (CI, ephemeral container,
remote VM), [`agent-browser`](https://github.com/vercel-labs/agent-browser)
spins up its own headless browser on demand:

```bash
agent-browser open http://vip-agentforce.vipdev.lndo.site/
agent-browser snapshot    # inspect DOM elements
agent-browser screenshot --output /tmp/check.png
```

### Key pages to check

(Get current URLs from `vip dev-env info --slug=vip-agentforce`.)

- Frontend: `http://vip-agentforce.vipdev.lndo.site/`
- Admin settings: `http://vip-agentforce.vipdev.lndo.site/wp-admin/admin.php?page=vip-agentforce`
- Auto-login: use LOGIN URL from `vip dev-env info`

Especially useful for: CMP chatbot widget rendering, settings page changes,
frontend asset loading.
