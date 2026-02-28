#!/usr/bin/env python3
"""Update workspace state snapshot for fast recovery."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any

WORKSPACE = Path(__file__).resolve().parents[1]
STATE_PATH = WORKSPACE / 'state.json'
TASKS_PATH = WORKSPACE / 'tasks.json'

MAX_COMMANDS = 8


def load_state() -> Dict[str, Any]:
  if STATE_PATH.exists():
    try:
      return json.loads(STATE_PATH.read_text())
    except json.JSONDecodeError:
      pass
  return {
    'lastUpdated': None,
    'summary': '',
    'activeTask': None,
    'recentCommands': [],
    'nextSteps': [],
    'notes': ''
  }


def lookup_task(task_id: str) -> Dict[str, Any] | None:
  if not TASKS_PATH.exists():
    return None
  try:
    data = json.loads(TASKS_PATH.read_text())
  except json.JSONDecodeError:
    return None
  for task in data.get('tasks', []):
    if task.get('id') == task_id:
      return {
        'id': task.get('id'),
        'title': task.get('title'),
        'status': task.get('status'),
        'assignee': task.get('assignee')
      }
  return None


def parse_command(entry: str) -> Dict[str, Any]:
  if '::' in entry:
    command, result = entry.split('::', 1)
  else:
    command, result = entry, ''
  return {
    'time': datetime.now(timezone.utc).isoformat(),
    'command': command.strip(),
    'result': result.strip()
  }


def main():
  parser = argparse.ArgumentParser(description='Update state.json snapshot')
  parser.add_argument('--task', help='Active task id (e.g., t23)')
  parser.add_argument('--summary', help='One-line summary of current work')
  parser.add_argument('--note', help='Longer free-form notes to store')
  parser.add_argument('--command', action='append', help="Record command/result entry using 'cmd::result' format")
  parser.add_argument('--next-step', action='append', help='Add a next-step bullet (repeatable)')
  parser.add_argument('--clear-commands', action='store_true', help='Clear command history before adding new ones')
  parser.add_argument('--clear-next', action='store_true', help='Clear next steps before adding new ones')
  parser.add_argument('--show', action='store_true', help='Print current state after updating')

  args = parser.parse_args()

  state = load_state()

  if args.task:
    task_info = lookup_task(args.task)
    state['activeTask'] = task_info or {'id': args.task}

  if args.summary:
    state['summary'] = args.summary

  if args.note:
    state['notes'] = args.note

  if args.clear_commands:
    state['recentCommands'] = []

  if args.command:
    commands: List[Dict[str, Any]] = [parse_command(item) for item in args.command]
    state['recentCommands'] = (state.get('recentCommands', []) + commands)[-MAX_COMMANDS:]

  if args.clear_next:
    state['nextSteps'] = []

  if args.next_step:
    next_steps = state.get('nextSteps', [])
    next_steps.extend(args.next_step)
    state['nextSteps'] = next_steps

  state['lastUpdated'] = datetime.now(timezone.utc).isoformat()

  STATE_PATH.write_text(json.dumps(state, indent=2))

  if args.show:
    print(json.dumps(state, indent=2))


if __name__ == '__main__':
  main()
