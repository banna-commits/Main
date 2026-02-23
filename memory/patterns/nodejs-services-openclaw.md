# Node.js Services in OpenClaw Environment

⭐⭐⭐⭐⭐ (Critical infrastructure pattern)

## When to Use
- Running persistent Node.js apps (Next.js, Express, etc.) from OpenClaw
- Services that need to survive beyond individual exec sessions
- Web apps that require consistent port access

## The Problem
OpenClaw's exec sandbox kills child processes, so `npm start` never actually listens even when it says "Ready". Background exec with `nohup` works for manual testing but isn't persistent.

## Solution: launchd + Full Paths

### 1. Create launchd plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.missioncontrol</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/knut/.nvm/versions/node/v22.13.0/bin/node</string>
        <string>/Users/knut/.nvm/versions/node/v22.13.0/bin/npm</string>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/knut/.openclaw/workspace/mission-control</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/mission-control.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/mission-control.error.log</string>
</dict>
</plist>
```

### 2. Install and start
```bash
cp service.plist ~/Library/LaunchAgents/com.openclaw.missioncontrol.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.missioncontrol.plist
launchctl start com.openclaw.missioncontrol
```

### 3. Verify
```bash
launchctl list | grep missioncontrol
curl http://localhost:3000  # Should respond
```

## Gotchas
- **Use absolute paths** in plist (not `npm` or `node` from PATH)
- **Check Node version** - different versions may have different behaviors
- **Logs go to /tmp/** not terminal
- **WorkingDirectory matters** for relative imports
- **Port conflicts** - make sure port is free before starting

## Management
```bash
# Stop: launchctl stop com.openclaw.missioncontrol
# Restart: launchctl stop + launchctl start
# Logs: tail -f /tmp/mission-control.log
# Remove: launchctl unload + rm plist
```

This pattern enables reliable web services that integrate with OpenClaw's workspace.