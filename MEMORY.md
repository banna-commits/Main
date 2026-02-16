# MEMORY.md — Long-Term Memory

See also: [[IDENTITY]], [[SOUL]], [[USER]]

## Who I Am
- BottenAnna (Anna), born [[memory/2026-02-14|2026-02-14]]
- Sharp, witty, brutally honest AI familiar on Knut's Mac Mini
- Emoji: ⚡

## Who Knut Is
- Norwegian, likes directness, no BS — see [[USER]]
- Timezone: Europe/Oslo
- Email: knutgreiner@gmail.com

## Preferences
- Language: English default, Norwegian for emails/pitches to Norwegian contacts
- Communication: Telegram (primary), webchat
- Telegram sender ID: 856859835
- Cost optimization: Sonnet for hooks/heartbeats, Opus for direct conversations

## Google Workspace (gog CLI)
- Account: bottenanna26@gmail.com
- Services: gmail, calendar, drive, contacts, docs, sheets
- OAuth client: Desktop app (258225610371-hmm7cjhs8gglseg4g7luota14vmi7pta)
- GCP project in Testing mode — test users must be added manually
- Pub/Sub topic: `projects/project-9906db25-afbf-4296-840/topics/gog-gmail-watch`
- Gmail push notifications → Tailscale Funnel → OpenClaw hooks → Telegram delivery
- Email draft flow: Knut forwards to bottenanna26 → I draft reply → send to knutgreiner@gmail.com

## Calendar
- AutoCalendar ID: `5d31d8d99ae65410e7af8b6edeb48c7803c576e5efe3c83a5f8f1ccd687e6e21@group.calendar.google.com`
- Shared between bottenanna26 and knutgreiner (both owners)
- Knut bruker ikke privat Google Calendar — AutoCalendar er primærkalenderen

## Infrastructure
- Tailscale hostname: knut-sin-mac-mini.tail37c89c.ts.net
- Pitch server: launchd (`com.openclaw.pitchserver`), port 8890, auto-restarts
- Tailscale Funnel: `/pitch` → http://127.0.0.1:8890

## Contacts
- Andre Gilje: andregilje@hotmail.com — TakstHjem co-founder interest #person
- Dag Meltveit: dag.meltveit@gmail.com — TakstHjem co-founder interest #person
- Martin Knutsen Tran: martin.knutsen.tran@vend.com — "Into the Body" app creator #person

## Projects

### TakstHjem (B2C property valuation) #project
- Challenger to boligverdi.no/eiendomsverdi.no
- Pitch deck: /pitch/index.html (hosted via Tailscale Funnel)
- Landing page MVP: /pitch/taksthjem/index.html
- Eiendomsverdi analysis: /pitch/eiendomsverdi-analyse.html
- Data supply chain research: /pitch/ev-data-research.txt
- MVP plan: /pitch/ev-mvp-plan.txt
- Andre is engaged — asked for MVP landing page, received it
- Key thread ID: 19c60c4e4f80ddc9

### Into the Body (somatic sensing app) #project
- Martin's project — guided body awareness/meditation sessions
- React Native/Expo at /into-the-body/
- Uses react-native-body-highlighter (female model, more unisex)
- Martin coming to finpusse the app
- Spec doc: https://docs.google.com/document/d/1JXXjxYL-6qlHW8UuRi8CxXhGANW6Znu-5jY_R1gNjCM/edit

## Lessons Learned #lesson
- Don't hand-draw SVG paths without a visual editor — use existing libraries
- PDF export from HTML is unreliable — hosted HTML links work better
- Desktop OAuth client type works; Web app causes redirect_uri_mismatch
- Gmail hook mapping needs `messageTemplate` or you get 400 errors
- python3 http.server dies between sessions — use launchd for persistence
- Heartbeats every 30m in main session block conversations — use cron jobs in isolated sessions instead
- Sub-agents with open-ended research tasks burn 200k tokens without delivering — give strict constraints (max N searches, short timeout, DO THE THING first)
- For email tasks: do it directly in main session or split into small focused sub-tasks
- Splitting long emails into 2 parts works well for complex responses
