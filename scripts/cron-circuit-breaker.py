#!/usr/bin/env python3
"""Cron Circuit Breaker — check for failing cron jobs.

Reads the cron state from OpenClaw and reports jobs with consecutive errors.
Designed to be called by an OpenClaw cron job (agentTurn) which can then
use the cron tool to disable tripped jobs and alert on Telegram.

Usage: python3 cron-circuit-breaker.py [--threshold N]
Output: JSON with tripped/healthy jobs for the agent to act on.
"""

import argparse, json, sys

# This script just analyzes — the OpenClaw agent does the disabling/alerting
# We read from stdin (piped cron list JSON) or a file

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--threshold", type=int, default=3)
    parser.add_argument("--file", help="JSON file with cron jobs list")
    args = parser.parse_args()

    if args.file:
        with open(args.file) as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)

    jobs = data if isinstance(data, list) else data.get("jobs", [])

    tripped = []
    healthy = []

    for job in jobs:
        if not job.get("enabled", True):
            continue
        state = job.get("state", {})
        errors = state.get("consecutiveErrors", 0)
        name = job.get("name", job.get("id", "?"))
        last_status = state.get("lastStatus", "unknown")
        last_error = state.get("lastError", "")

        entry = {"name": name, "id": job.get("id"), "errors": errors,
                 "lastStatus": last_status, "lastError": last_error}

        if errors >= args.threshold:
            tripped.append(entry)
        else:
            healthy.append(entry)

    result = {
        "threshold": args.threshold,
        "total": len(jobs),
        "healthy": len(healthy),
        "tripped": len(tripped),
        "trippedJobs": tripped
    }

    print(json.dumps(result, indent=2))

    if tripped:
        sys.exit(1)  # non-zero = action needed


if __name__ == "__main__":
    main()
