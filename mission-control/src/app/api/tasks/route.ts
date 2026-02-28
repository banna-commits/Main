import { NextResponse, NextRequest } from 'next/server';
import { readFile, writeFile } from 'fs/promises';

/* eslint-disable @typescript-eslint/no-explicit-any */
const TASKS_PATH = '/Users/knut/.openclaw/workspace/tasks.json';

async function readTasks() {
  const data = await readFile(TASKS_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeTasks(data: any) {
  data.lastUpdated = new Date().toISOString();
  await writeFile(TASKS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const data = await readTasks();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ tasks: [] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const data = await readTasks();
    const idx = data.tasks.findIndex((t: any) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    data.tasks[idx] = { ...data.tasks[idx], ...updates };
    await writeTasks(data);
    return NextResponse.json(data.tasks[idx]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const data = await readTasks();
    data.tasks = data.tasks.filter((t: any) => t.id !== id);
    await writeTasks(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
