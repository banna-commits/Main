# WORKFLOW_AUTO.md

Use this checklist whenever the session auto-resumes (heartbeats, cron wakeups, or after compaction):

1. **Re-anchor**
   - Read SOUL.md, USER.md, and today's + yesterday's memory logs if not already in context
   - Confirm HEARTBEAT.md for current background duties

2. **State sync**
   - Run required heartbeat checks (email/calendar/weather/memory maintenance) per rotation and log timestamps in `memory/heartbeat-state.json`
   - Note any incidents or fixes in `memory/YYYY-MM-DD.md` immediately (write-through rule)
   - Update `state.json` via `scripts/state_snapshot.py` whenever you change focus so recovery after compaction has fresh last commands + next steps

3. **Services**
   - Verify persistent services (gateway, mission-control, cron jobs) are healthy if they were touched this session
   - Document deviations (port changes, restarts, failures)

4. **Reporting**
   - Alert Knut only when there's actionable info (new email, calendar event <2h, service issue)
   - Otherwise respond with HEARTBEAT_OK to keep the channel quiet
