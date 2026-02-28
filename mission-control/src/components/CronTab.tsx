'use client';

import type { CronLogsData } from '@/types';

interface Props {
  data: CronLogsData | null;
}

function statusBadge(status?: string) {
  const label = (status ?? 'unknown').toUpperCase();
  let color = 'bg-border text-text';
  if (status === 'ok') color = 'bg-green/20 text-green';
  else if (status === 'error') color = 'bg-red/20 text-red';
  else if (status === 'warning') color = 'bg-yellow/20 text-yellow-700';
  return <span className={`text-[11px] px-2 py-0.5 rounded ${color}`}>{label}</span>;
}

function formatDuration(ms?: number) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('no-NO');
  } catch {
    return value;
  }
}

export default function CronTab({ data }: Props) {
  if (!data) {
    return <div className="text-sm text-text-dim">Laster cron-data…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-text-dim">Oppdatert {formatTime(data.lastUpdated)}</div>
      {data.jobs.length === 0 ? (
        <div className="text-sm text-text-dim">Ingen cron-jobber funnet.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          {data.jobs.map(job => (
            <div key={job.id} className="border border-border rounded-xl p-4 bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{job.name}</div>
                  <div className="text-xs text-text-dim">{job.id}</div>
                </div>
                <div className="flex flex-col items-end gap-1 text-right text-xs">
                  <div className="text-text-dim">Neste: {formatTime(job.nextRun)}</div>
                  <div className="text-text-dim">Feil på rad: {job.consecutiveErrors ?? 0}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-dim">
                <span>⏱ {job.schedule}{job.timezone ? ` (${job.timezone})` : ''}</span>
                {job.model && <span>🤖 {job.model}</span>}
                {job.lastError && <span className="text-red">⚠️ {job.lastError}</span>}
              </div>
              <div className="mt-4 space-y-2">
                {job.runs.length === 0 ? (
                  <div className="text-xs text-text-dim">Ingen kjøringer registrert.</div>
                ) : (
                  job.runs.map((run, idx) => (
                    <div key={`${run.time}-${idx}`} className="flex justify-between items-start text-xs border border-border rounded-lg p-2 bg-background">
                      <div>
                        <div className="font-medium text-text">{formatTime(run.time)}</div>
                        <div className="text-text-dim">Varighet {formatDuration(run.durationMs)}</div>
                        {run.summary && <div className="text-text mt-1">{run.summary}</div>}
                        {run.error && <div className="text-red mt-1">{run.error}</div>}
                      </div>
                      {statusBadge(run.status)}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
