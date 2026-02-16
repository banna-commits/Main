# HEARTBEAT.md

See also: [[AGENTS]], [[MEMORY]], [[TOOLS]]

## Always (every beat)

- **Pitch server**: Managed by launchd (`com.openclaw.pitchserver`), auto-restarts. Only check if something seems wrong.

## Checks (rotate — pick 1-2 per beat, don't do all every time)

- **Email**: `gog gmail search 'newer_than:2h is:unread' --max 5 --account bottenanna26@gmail.com` — notify on Telegram if anything important
- **Calendar**: `gog calendar events primary --from <now> --to <+48h> --account bottenanna26@gmail.com` + check AutoCalendar — notify if event within 2h
- **Memory maintenance**: Every few days, review recent `memory/` files and update MEMORY.md

## Rules
- Quiet hours: 23:00–08:00 (Europe/Oslo) — HEARTBEAT_OK unless urgent
- Don't repeat checks done <30 min ago
- Track checks in `memory/heartbeat-state.json`
- Only notify on Telegram if something actually needs attention
- If nothing notable: HEARTBEAT_OK
