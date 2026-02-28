# Projects

## TakstHjem (B2C property valuation) #project
- **E-post alltid til alle tre:** Andre, Dag, Knut
- Challenger to boligverdi.no/eiendomsverdi.no
- Pitch deck: /pitch/index.html (hosted via Tailscale Funnel)
- Landing page MVP: /pitch/taksthjem/index.html
- Eiendomsverdi analysis: /pitch/eiendomsverdi-analyse.html
- Data supply chain research: /pitch/ev-data-research.txt
- MVP plan: /pitch/ev-mvp-plan.txt
- Andre is engaged — asked for MVP landing page, received it
- Key thread ID: 19c60c4e4f80ddc9
- eTakst is NOT legally regulated — proprietary Eiendomsverdi AS product
- Utlånsforskriften §4 doesn't specify who must do property valuation — banks have full freedom

## Into the Body (somatic sensing app) #project
- Martin's project — guided body awareness/meditation sessions
- React Native/Expo at /projects/into-the-body/
- Uses react-native-body-highlighter (female model, more unisex)
- Martin coming to finpusse the app
- Spec doc: https://docs.google.com/document/d/1JXXjxYL-6qlHW8UuRi8CxXhGANW6Znu-5jY_R1gNjCM/edit

## Boretunet (ringeliste for Andre) #project
- Andre Gilje driver Boretunet (Jæren) — surfekurs, overnatting, gruppeturer
- Trenger ringeliste: kontaktpersoner i skoler, idrettslag, foreninger, folkehøyskoler, bedrifter
- Prosjektmappe: /Users/knut/.openclaw/Boretunet/
- Boretunet nettside: www.boretunet.no

## Investment Research #investing
- Knut interested in physical-moat companies at low PE that benefit from AI admin cost cuts
- Top picks: Protector Forsikring (PROT), Bravida (BRAV), Coor (COOR), Securitas (SECU B), Sampo (SAMPO)
- Thesis: 50% admin cut → 40-300% bunnlinje-økning depending on margin profile
- Low-margin service companies see biggest relative gains

## Mission Control #internal
- Next.js 16 app running via launchd on port 3001 (Node v22). Tailnet URL: https://knut-sin-mac-mini.tail74a1a0.ts.net:3001
- Tabs: Tasks, Activity, Schedule, System, Calendar, Investments, Trenger Knut, Memory, Cron
- Recent upgrades: interactive Trenger Knut tab (modal edit + "⚡ Jobbe med"), context strip widget (state.json + heartbeat), Cron tab + log API in progress, tab width/wrap fixes
- Supporting scripts: sync-mission-control.sh keeps mirror fresh; Infra Sync cron regenerates JSON data every 6h
- Outstanding: finish Cron tab wiring + lint fixes, continue UI polish
