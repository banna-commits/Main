import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const WORKSPACE = '/Users/knut/.openclaw/workspace';

export async function GET() {
  try {
    const data = await readFile(path.join(WORKSPACE, 'schedule.json'), 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ jobs: [], upcoming: [] }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
