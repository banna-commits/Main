# OpenClaw Memory System — Setup Guide

*En guide for å sette opp et smart minnesystem for OpenClaw på ~30 minutter.*

## Hva du får

- **Semantic search** med lokale embeddings (gratis, ingen API-kvote)
- **Hybrid search** (keyword + vektor) for bedre treff
- **Strukturert minne** — daglige logger, langtidsminne, mønstre, relasjoner
- **Automatisk vedlikehold** — importance scoring, decay/arkivering, indeksering
- **Relasjonsgraf** mellom personer, prosjekter og verktøy

## Forutsetninger

- OpenClaw installert og kjørende
- [Ollama](https://ollama.com) installert lokalt
- Python 3 tilgjengelig

## Steg 1: Installer embedding-modell

```bash
ollama pull nomic-embed-text
```

## Steg 2: Konfigurer OpenClaw

Kjør dette i OpenClaw-chatten eller patch config manuelt:

```json5
// openclaw.json → agents.defaults.memorySearch
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "enabled": true,
        "provider": "openai",
        "model": "nomic-embed-text",
        "remote": {
          "baseUrl": "http://127.0.0.1:11434/v1"
        },
        "fallback": "local",
        "query": {
          "hybrid": {
            "enabled": true,
            "vectorWeight": 0.7,
            "textWeight": 0.3,
            "candidateMultiplier": 4
          }
        }
      }
    }
  }
}
```

Dette gir deg:
- Lokale embeddings via Ollama (OpenAI-kompatibelt API)
- Hybrid search (70% semantisk, 30% keyword/BM25)
- Ingen ekstern API, ingen kvote, ingen kostnad

## Steg 3: Mappestruktur

Opprett denne strukturen i workspace (`~/.openclaw/workspace/`):

```
memory/
├── people.md          # Personregister
├── projects.md        # Aktive prosjekter
├── infra.md           # Infrastruktur og config
├── lessons.md         # Ting lært på den harde måten
├── preferences.md     # Brukerens preferanser
├── patterns/          # Workflow-oppskrifter
│   └── README.md
├── weekly/            # Ukesdigest (genereres automatisk)
└── archive/           # Arkiverte gamle dagfiler

MEMORY.md              # Kuratert langtidsminne (hovedfil)
```

```bash
cd ~/.openclaw/workspace
mkdir -p memory/patterns memory/weekly memory/archive
touch memory/people.md memory/projects.md memory/infra.md
touch memory/lessons.md memory/preferences.md
touch MEMORY.md
```

## Steg 4: Scripts

Lag disse i `scripts/`:

### `scripts/score-memories.py` — Importance scoring (heuristikk)
Scorer hver seksjon i daglige logger 1-10 basert på nøkkelord (beslutninger, personer, økonomi, action items). Ingen LLM nødvendig — kjører instant.

### `scripts/build-context-index.py` — Topic-indeks
Scanner alle memory-filer og bygger en JSON-indeks med topics → filreferanser med linjenumre.

### `scripts/build-relations.py` — Relasjonsgraf
Ekstraherer personer, prosjekter, verktøy og relasjoner mellom dem.

### `scripts/memory-decay.py` — Konsolidering og arkivering
- Filer < 7 dager: beholdes
- Filer 7-30 dager: komprimeres til ukesdigest via Ollama
- Filer > 30 dager: highlights ekstraheres, originaler arkiveres

### `scripts/memory-commit.sh` — Git-backup
```bash
#!/bin/bash
cd ~/.openclaw/workspace
git add memory/ MEMORY.md
git diff --cached --quiet || git commit -m "memory: auto-commit $(date +%Y-%m-%d)"
```

> **Tips:** Vi deler gjerne våre scripts. Spør Knut/Banna om å sende dem.

## Steg 5: Automatisering (cron)

### Infra Sync — hver 6. time
```
Kjører: context-index, relations, importance scoring
Schedule: 0 2,8,14,20 * * *
Model: billigste lokale (qwen3-fast e.l.)
```

### Weekly Memory Consolidation — søndager kl 21
```
Kjører: decay pipeline + oppdaterer langtidsfiler + git commit
Schedule: 0 21 * * 0
Model: Sonnet (trenger forståelse for å konsolidere)
```

### End-of-Day — kl 22:55
```
Genererer daglig oppsummering, appendes til dagens logg
Schedule: 55 22 * * *
Model: Sonnet
```

Opprett via OpenClaw `/cron` eller `cron` tool.

## Steg 6: Subagent-config (anbefalt)

```json5
// openclaw.json → agents.defaults.subagents
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": "anthropic/claude-sonnet-4-20250514",
        "maxConcurrent": 8
      }
    }
  }
}
```

**Viktig lærdom:** Ikke la subagenter arve hovedmodellen (f.eks. Opus). Sett en billigere default. Bruk `runTimeoutSeconds: 300` for komplekse oppgaver.

## Prinsipper

1. **Skriv alt ned** — "mental notes" overlever ikke session-restart
2. **Heuristikk > LLM for scoring** — 1000x raskere, gratis, deterministisk
3. **Lokal Ollama for embeddings** — unngår API-kvote og kostnader
4. **Decay = viktig** — ukomprimerte dagfiler fyller kontekstvinduet
5. **Importance guider decay** — høy-score seksjoner overlever komprimering
6. **Bash 3.2 på macOS suger** — bruk Python for alt som trenger arrays/dicts
7. **Git-commit memory regelmessig** — versjonert minne = trygt minne

## Arkitektur-oversikt

```
Daglig bruk:
  Samtale → daglig logg (memory/YYYY-MM-DD.md)
  
Hver 6. time (Infra Sync):
  → Importance scoring (heuristikk)
  → Context-index rebuild (topics → filer)
  → Relations-graf rebuild (entiteter + kanter)

Hver kveld (22:55):
  → End-of-day oppsummering → appendes til daglig logg

Søndager (21:00):
  → Decay: 7-30d filer → ukesdigest
  → Decay: >30d filer → arkiv (etter highlight-ekstraksjon)
  → Konsolidering: oppdater langtidsfiler
  → Git commit

Søk:
  memory_search → hybrid (BM25 + vektor via nomic-embed-text)
```

---

*Satt opp av Knut & BottenAnna, februar 2026. Spørsmål? Slå opp i OpenClaw docs eller spør i Discord: https://discord.com/invite/clawd*
