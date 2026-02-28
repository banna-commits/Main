import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const JOBS_PATH = '/Users/knut/.openclaw/cron/jobs.json';
const RUNS_DIR = '/Users/knut/.openclaw/cron/runs';
const RUN_LIMIT = 6;

type CronJobFile = {
  id: string;
  name?: string;
  schedule?: { expr?: string; tz?: string };
  payload?: { model?: string };
  state?: {
    nextRunAtMs?: number;
    consecutiveErrors?: number;
    lastStatus?: string;
    lastError?: string;
  };
};

type CronRunFile = {
  ts?: number;
  status?: string;
  summary?: string;
  error?: string;
  durationMs?: number;
  sessionId?: string;
  sessionKey?: string;
  deliveryStatus?: string;
};

async function readJobs(): Promise<CronJobFile[]> {
  try {
    const raw = await fs.readFile(JOBS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.jobs ?? [];
  } catch (err) {
    console.error('Failed to read cron jobs', err);
    return [];
  }
}

async function readRuns(jobId: string, limit: number) {
  const filePath = path.join(RUNS_DIR, `${jobId}.jsonl`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    const latest = lines.slice(-limit).reverse();
    return latest
      .map(line => {
        try {
          return JSON.parse(line) as CronRunFile;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as CronRunFile[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
  	console.error(`Failed to read runs for ${jobId}`, err);
    return [];
  }
}

function msToIso(ms?: number | null) {
  if (!ms) return null;
  try {
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

export async function GET() {
  const jobs = await readJobs();
  const enriched = await Promise.all(
    jobs.map(async job => {
      const runs = await readRuns(job.id, RUN_LIMIT);
      return {
        id: job.id,
        name: job.name ?? job.id,
        schedule: job.schedule?.expr ?? '—',
        timezone: job.schedule?.tz,
        model: job.payload?.model,
        nextRun: msToIso(job.state?.nextRunAtMs ?? null),
        consecutiveErrors: job.state?.consecutiveErrors ?? 0,
        lastStatus: job.state?.lastStatus,
        lastError: job.state?.lastError,
        runs: runs.map(run => ({
          time: msToIso(run.ts ?? null),
          status: run.status ?? 'unknown',
          durationMs: run.durationMs,
          summary: run.summary,
          error: run.error,
          sessionId: run.sessionId,
          sessionKey: run.sessionKey,
          deliveryStatus: run.deliveryStatus,
        })),
      };
    })
  );

  enriched.sort((a, b) => {
    const aErrors = a.consecutiveErrors ?? 0;
    const bErrors = b.consecutiveErrors ?? 0;
    if (aErrors === bErrors) return a.name.localeCompare(b.name);
    return bErrors - aErrors;
  });

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    jobs: enriched,
  });
}

export const dynamic = 'force-dynamic';
