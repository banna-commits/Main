#!/usr/bin/env python3
"""Watchdog for morning briefing prefetch output/state."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover (Python <3.9)
    from backports.zoneinfo import ZoneInfo  # type: ignore

WORKDIR = Path("/Users/knut/.openclaw/workspace")
DEFAULT_OUTPUT = WORKDIR / "briefing-data.txt"
DEFAULT_STATE = WORKDIR / "state" / "morning_prefetch.json"
LOCAL_TZ = ZoneInfo("Europe/Oslo")

def parse_hhmm(value: Optional[str]):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%H:%M").time()
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"Invalid time '{value}' (HH:MM)") from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate morning prefetch freshness")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Path to briefing-data.txt")
    parser.add_argument("--state", default=str(DEFAULT_STATE), help="Path to morning_prefetch state JSON")
    parser.add_argument("--max-age-minutes", type=int, default=75, help="Max allowed age for output file")
    parser.add_argument("--state-max-age-minutes", type=int, default=90, help="Max allowed age for state file")
    parser.add_argument("--expected-date", help="YYYY-MM-DD that output file must match")
    parser.add_argument("--window-start", type=parse_hhmm, help="HH:MM local start time to enforce")
    parser.add_argument("--window-end", type=parse_hhmm, help="HH:MM local end time to enforce")
    parser.add_argument("--json", action="store_true", help="Print JSON result instead of text")
    return parser.parse_args()


def iso_to_dt(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def within_window(now_local: datetime, start, end) -> bool:
    if start is None or end is None:
        return True
    today_start = now_local.replace(hour=start.hour, minute=start.minute, second=0, microsecond=0)
    today_end = now_local.replace(hour=end.hour, minute=end.minute, second=0, microsecond=0)
    if start <= end:
        return today_start <= now_local <= today_end
    # window crosses midnight
    return now_local >= today_start or now_local <= today_end


def main() -> int:
    args = parse_args()
    now_local = datetime.now(LOCAL_TZ)
    now_utc = datetime.now(timezone.utc)

    if args.window_start and args.window_end and not within_window(now_local, args.window_start, args.window_end):
        message = {
            "status": "SKIP",
            "reason": "outside window",
            "window": {
                "start": args.window_start.strftime("%H:%M"),
                "end": args.window_end.strftime("%H:%M"),
            },
            "timestamp": now_local.isoformat(),
        }
        print(json.dumps(message, indent=2) if args.json else f"SKIP: outside window {message['window']['start']}–{message['window']['end']}")
        return 0

    output_path = Path(args.output)
    state_path = Path(args.state)
    errors: List[str] = []
    info: List[str] = []

    if not output_path.exists():
        errors.append(f"Missing output file: {output_path}")
        output_mtime = None
    else:
        output_stat = output_path.stat()
        output_mtime = datetime.fromtimestamp(output_stat.st_mtime, timezone.utc).astimezone(LOCAL_TZ)
        age_minutes = (now_local - output_mtime).total_seconds() / 60
        info.append(f"Output age: {age_minutes:.1f}m")
        if age_minutes > args.max_age_minutes:
            errors.append(f"briefing-data.txt too old ({age_minutes:.1f}m > {args.max_age_minutes}m)")
        if output_stat.st_size == 0:
            errors.append("briefing-data.txt is empty")
        if args.expected_date and output_mtime.date().isoformat() != args.expected_date:
            errors.append(
                f"briefing-data.txt date {output_mtime.date().isoformat()} != expected {args.expected_date}"
            )

    state_data = None
    if not state_path.exists():
        errors.append(f"Missing state file: {state_path}")
    else:
        try:
            state_data = json.loads(state_path.read_text())
        except json.JSONDecodeError as exc:
            errors.append(f"State JSON invalid: {exc}")
        else:
            end_time_str = state_data.get("endTime")
            exit_code = state_data.get("exitCode")
            error_count = state_data.get("errorCount")
            if isinstance(exit_code, int):
                if exit_code != 0:
                    errors.append(f"Prefetch exit code {exit_code}")
            else:
                errors.append("State missing exitCode")
            if isinstance(error_count, int) and error_count > 0:
                errors.append(f"Prefetch logged {error_count} errors")
            elif not isinstance(error_count, int):
                errors.append("State missing errorCount")

            if end_time_str:
                try:
                    end_dt = iso_to_dt(end_time_str).astimezone(LOCAL_TZ)
                    state_age = (now_local - end_dt).total_seconds() / 60
                    info.append(f"State age: {state_age:.1f}m")
                    if state_age > args.state_max_age_minutes:
                        errors.append(
                            f"State age {state_age:.1f}m > {args.state_max_age_minutes}m"
                        )
                except ValueError as exc:
                    errors.append(f"Invalid endTime in state: {exc}")
            else:
                errors.append("State missing endTime")

    status = "OK" if not errors else "ERROR"
    summary = {
        "status": status,
        "time": now_local.isoformat(),
        "output": str(output_path),
        "state": str(state_path),
        "info": info,
        "errors": errors,
    }

    if args.json:
        print(json.dumps(summary, indent=2))
    else:
        if status == "OK":
            detail = ", ".join(info) if info else "healthy"
            print(f"OK: Morning prefetch healthy ({detail})")
        else:
            detail = "; ".join(errors)
            print(f"ERROR: {detail}")

    return 0 if status == "OK" else 1


if __name__ == "__main__":
    raise SystemExit(main())
