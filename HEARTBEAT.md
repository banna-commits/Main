# HEARTBEAT.md

See also: [[AGENTS]], [[MEMORY]], [[TOOLS]]

## Always (every beat)

Nothing — infra scripts (memory-index, investments, mission-control) run via "Infra Sync" cron every 6h.

## Checks (rotate — pick 1-2 per beat, don't do all every time)

### Email check
Run this exact command:
```bash
gog gmail search 'newer_than:2h is:unread' --max 5 --account banna@bottenanna.no
```
Notify on Telegram if anything important.

### Calendar check
Run these two exact commands (replace DATE_NOW and DATE_48H with actual ISO dates like 2026-02-19T12:00:00):
```bash
gog calendar events primary --from DATE_NOW --to DATE_48H --account banna@bottenanna.no
```
```bash
gog calendar events 5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com --from DATE_NOW --to DATE_48H --account banna@bottenanna.no
```
Notify if event within 2h.

### Memory maintenance
Every few days, review recent `memory/` files and update MEMORY.md.

## Rules
- Quiet hours: 23:00–08:00 (Europe/Oslo) — HEARTBEAT_OK unless urgent
- Don't repeat checks done <30 min ago
- Track checks in `memory/heartbeat-state.json`
- Only notify on Telegram if something actually needs attention
- If nothing notable: reply HEARTBEAT_OK
- **IMPORTANT**: Run commands exactly as written above. Do not invent flags or modify syntax.
