# Telegram MCP (V1)

This server includes optional Telegram MCP tools:

- `telegram_send_message`
- `telegram_get_recent_messages`
- `telegram_reply`

## Required Environment Variables

Set these before starting `bimba-mcp`:

- `TELEGRAM_MCP_ENABLED=true`
- `TELEGRAM_BOT_TOKEN=<bot token>`
- `TELEGRAM_ALLOWED_CHAT_IDS=<comma-separated numeric chat IDs>`
- `TELEGRAM_ALLOWED_USER_IDS=<comma-separated numeric Telegram user IDs>`

Optional:

- `TELEGRAM_DEFAULT_CHAT_ID=<numeric chat id>` (defaults to first allowlisted chat)
- `TELEGRAM_POLL_INTERVAL_MS=1500` (range `500..30000`)
- `TELEGRAM_MAX_RECENT_MESSAGES=200` (range `10..1000`)
- `TELEGRAM_API_BASE_URL=https://api.telegram.org`

## Security Model

- Strict allowlist is enforced on both `chat_id` and sender `user_id`.
- If allowlists are missing or malformed while enabled, startup fails closed.
- Token values are never returned in tool output.

## Privacy Mode Requirement

For group-context reads, disable bot privacy mode in BotFather:
- `/setprivacy` -> select bot -> `Disable`

If privacy mode stays enabled, the bot may miss non-command/non-mention messages.

## Notes

- V1 uses polling (`getUpdates`) only.
- V1 does not include webhook delivery or MTProto user-account support.
