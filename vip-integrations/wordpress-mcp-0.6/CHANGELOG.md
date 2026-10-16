# Changelog

## [0.6.2] - 2026-10-16

### Fixed

- Session creation rejects initialization parameters larger than 4 KiB in their PHP serialized representation before writing session metadata. This is an Adapter storage policy; MCP does not impose this byte limit. Oversized HTTP initialization returns JSON-RPC `-32602` (Invalid params), while direct `SessionManager::create_session()` calls retain their `false` failure result. Accepted parameters are preserved unchanged by the session manager.
- HTTP session initialization omits `clientInfo.icons` from the retained copy before applying the storage limit, allowing clients with large inline icons to connect. The inbound request is unchanged; all other accepted initialization fields are retained.
- Legacy session rows that exceed the budget for their stored session count are recovered with a conditional delete. Concurrent replacements and valid sessions survive recovery and reductions to the configured session limit. Affected clients initialize again.
