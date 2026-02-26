#!/bin/zsh
cd /Users/knut/.openclaw/workspace/mission-control || exit 1
exec npm run start -- --hostname 0.0.0.0 --port 3020
