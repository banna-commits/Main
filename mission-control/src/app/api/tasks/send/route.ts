import { NextResponse, NextRequest } from 'next/server';
import { readFile, writeFile } from 'fs/promises';

const QUEUE_PATH = '/Users/knut/.openclaw/workspace/task-queue.json';

export async function POST(req: NextRequest) {
  try {
    const { taskId, title } = await req.json();
    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

    let queue: any[] = [];
    try {
      const existing = await readFile(QUEUE_PATH, 'utf-8');
      queue = JSON.parse(existing);
    } catch { /* file doesn't exist yet */ }

    queue.push({ taskId, title, timestamp: new Date().toISOString() });
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf-8');
    return NextResponse.json({ ok: true, queued: queue.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
