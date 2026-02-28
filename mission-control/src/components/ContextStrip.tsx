'use client';

import type { StateSnapshot, HeartbeatState } from '@/types';

interface Props {
  stateData: StateSnapshot | null;
  heartbeatData: HeartbeatState | null;
}

const CHECK_LABELS: Record<string, string> = {
  email: 'Email',
  calendar: 'Calendar',
  weather: 'Weather',
  memoryMaintenance: 'Memory maint.'
};

function formatTime(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('no-NO');
  } catch {
    return value;
  }
}

function formatEpoch(sec?: number | null) {
  if (!sec) return '—';
  return new Date(sec * 1000).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
}

export default function ContextStrip({ stateData, heartbeatData }: Props) {
  if (!stateData && !heartbeatData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-xs text-text-dim">State snapshot</div>
        <div className="text-base font-semibold mt-1">{stateData?.summary || 'No summary'}</div>
        {stateData?.activeTask?.id && (
          <div className="text-xs text-text-dim mt-1">
            Active: {stateData.activeTask.id} {stateData.activeTask.title ? `— ${stateData.activeTask.title}` : ''}
          </div>
        )}
        <div className="text-xs text-text-dim mt-3">
          Updated {formatTime(stateData?.lastUpdated)}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-xs text-text-dim">Recent command</div>
        {!stateData?.recentCommands?.length ? (
          <div className="text-sm text-text-dim mt-2">No commands logged</div>
        ) : (
          <div className="mt-2">
            <div className="text-sm font-medium text-text">{stateData.recentCommands.at(-1)?.command}</div>
            {stateData.recentCommands.at(-1)?.result && (
              <div className="text-xs text-text-dim mt-1">{stateData.recentCommands.at(-1)?.result}</div>
            )}
            <div className="text-xs text-text-dim mt-2">
              {formatTime(stateData.recentCommands.at(-1)?.time || stateData.lastUpdated)}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-xs text-text-dim">Last heartbeat checks</div>
        {!heartbeatData ? (
          <div className="text-sm text-text-dim mt-2">No data</div>
        ) : (
          <div className="mt-2 space-y-1 text-sm">
            {Object.entries(CHECK_LABELS).map(([key, label]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-text-dim">{label}</span>
                <span className="text-text">{formatEpoch(heartbeatData.lastChecks?.[key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
