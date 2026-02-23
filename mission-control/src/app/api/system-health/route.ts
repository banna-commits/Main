import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const WORKSPACE = '/Users/knut/.openclaw/workspace';

export async function GET() {
  try {
    const data = await readFile(path.join(WORKSPACE, 'system-health.json'), 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ 
      lastUpdated: new Date().toISOString(),
      gateway: { status: 'unknown', uptime: '0', version: '0.0.0', pid: 0, memoryMB: 0 },
      channels: {},
      cron: { total: 0, ok: 0, error: 0 },
      workspace: { sizeMB: 0, memoryFiles: 0, lastCommit: 'unknown' },
      system: { cpuPercent: 0, memoryPercent: 0, diskPercent: 0 }
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';