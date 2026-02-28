#!/usr/bin/env python3
"""Cron watchdog: scans job metadata + run logs for anomalies."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

CRON_DIR = Path('/Users/knut/.openclaw/cron')
JOBS_PATH = CRON_DIR / 'jobs.json'
RUNS_DIR = CRON_DIR / 'runs'
OUTPUT_PATH = Path('/Users/knut/.openclaw/workspace/logs/cron/watchdog.json')
STATE_SCRIPT = Path('/Users/knut/.openclaw/workspace/scripts/state_snapshot.py')
MAX_RUNS = 5
ERROR_THRESHOLD = 3
STALE_GRACE_MINUTES = 90  # if nextRun deadline missed by this margin


def load_jobs() -> List[Dict[str, Any]]:
    if not JOBS_PATH.exists():
        raise FileNotFoundError(f'Missing jobs file: {JOBS_PATH}')
    data = json.loads(JOBS_PATH.read_text())
    return data.get('jobs', [])


def load_runs(job_id: str) -> List[Dict[str, Any]]:
    file_path = RUNS_DIR / f'{job_id}.jsonl'
    if not file_path.exists():
        return []
    lines = file_path.read_text().strip().split('\n')
    records: List[Dict[str, Any]] = []
    for line in lines[-MAX_RUNS:]:
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    records.reverse()  # newest first
    return records


def iso_from_ms(ms: int | None) -> str | None:
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()


def detect_issues(job: Dict[str, Any], runs: List[Dict[str, Any]]) -> Tuple[List[str], Dict[str, Any]]:
    issues: List[str] = []
    state = job.get('state', {})
    consecutive = state.get('consecutiveErrors', 0) or 0
    last_status = state.get('lastStatus')
    next_run_ms = state.get('nextRunAtMs')
    last_run_ms = state.get('lastRunAtMs')
    now_ms = datetime.now(timezone.utc).timestamp() * 1000

    if consecutive >= ERROR_THRESHOLD:
        issues.append(f'{consecutive} consecutive errors')

    if last_status == 'error':
        issues.append('last run failed')

    stale_threshold = STALE_GRACE_MINUTES * 60 * 1000
    if next_run_ms and now_ms - next_run_ms > stale_threshold:
        issues.append('next run overdue')

    details = {
        'lastRun': iso_from_ms(last_run_ms),
        'nextRun': iso_from_ms(next_run_ms),
        'lastStatus': last_status,
        'consecutiveErrors': consecutive,
        'recentRuns': [
            {
                'time': iso_from_ms(r.get('ts')),
                'status': r.get('status'),
                'summary': r.get('summary'),
                'error': r.get('error'),
                'durationMs': r.get('durationMs'),
            }
            for r in runs
        ],
    }
    return issues, details


def run_state_update(message: str, dry_run: bool) -> None:
    if dry_run or not STATE_SCRIPT.exists():
        return
    cmd = [str(STATE_SCRIPT), '--command', message]
    try:
        subprocess.run(cmd, check=True)
    except Exception as exc:  # pragma: no cover
        print(f'[warn] failed to update state snapshot: {exc}', file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description='Cron watchdog scanner')
    parser.add_argument('--dry-run', action='store_true', help='Do not write state snapshot')
    parser.add_argument('--output', type=Path, default=OUTPUT_PATH, help='Override output path')
    args = parser.parse_args()

    jobs = load_jobs()
    now = datetime.now(timezone.utc).isoformat()
    report = {
        'generatedAt': now,
        'issues': [],
        'jobs': {},
    }

    for job in jobs:
        job_id = job.get('id')
        if not job_id:
            continue
        runs = load_runs(job_id)
        issues, details = detect_issues(job, runs)
        report['jobs'][job_id] = {
            'name': job.get('name', job_id),
            **details,
        }
        if issues:
            report['issues'].append({'jobId': job_id, 'name': job.get('name', job_id), 'issues': issues})

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2))

    if report['issues']:
        summary = ', '.join(f"{item['name']}: {'; '.join(item['issues'])}" for item in report['issues'])
        run_state_update(f"cron_watchdog::{summary}", args.dry_run)

    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
