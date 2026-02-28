import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

const HEARTBEAT_PATH = '/Users/knut/.openclaw/workspace/memory/heartbeat-state.json';

export async function GET() {
  try {
    const raw = await fs.readFile(HEARTBEAT_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read heartbeat state', err);
    return NextResponse.json({ lastChecks: {}, notifiedEvents: {} });
  }
}

export const dynamic = 'force-dynamic';
