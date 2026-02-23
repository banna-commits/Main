'use client';

import { SystemHealth } from '@/types';

interface ProgressBarProps {
  value: number;
  label: string;
}

function ProgressBar({ value, label }: ProgressBarProps) {
  const getColor = () => {
    if (value < 50) return 'bg-green';
    if (value < 80) return 'bg-yellow';
    return 'bg-red';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--color-text-dim)]">{label}</span>
        <span className="text-[var(--color-text)]">{value}%</span>
      </div>
      <div className="bg-[var(--color-bg)] rounded h-2">
        <div className={`h-2 rounded ${getColor()}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

export default function SystemTab({ data }: { data: SystemHealth | null }) {
  if (!data) {
    return (
      <div className="text-center py-8 text-[var(--color-text-dim)]">
        <div className="text-2xl mb-2">📡</div>
        <div>No system health data available</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'ok': return 'text-green';
      case 'warning': return 'text-yellow';
      case 'error':
      case 'failed': return 'text-red';
      default: return 'text-[var(--color-text-dim)]';
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-lg font-bold mb-1">{data.gateway.status}</div>
          <div className="text-xs text-[var(--color-text-dim)] mb-2">GATEWAY</div>
          <div className="text-xs">
            <div>v{data.gateway.version}</div>
            <div>Uptime: {data.gateway.uptime}</div>
            <div>PID: {data.gateway.pid}</div>
            <div>Memory: {data.gateway.memoryMB}MB</div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-lg font-bold mb-1">{data.cron.ok}/{data.cron.total}</div>
          <div className="text-xs text-[var(--color-text-dim)] mb-2">CRON JOBS</div>
          {data.cron.error > 0 && (
            <div className="text-xs text-red">{data.cron.error} errors</div>
          )}
          {data.cron.lastError && (
            <div className="text-xs text-[var(--color-text-dim)] mt-1">
              Last: {data.cron.lastError.job}
            </div>
          )}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-lg font-bold mb-1">{data.workspace.sizeMB}MB</div>
          <div className="text-xs text-[var(--color-text-dim)] mb-2">WORKSPACE</div>
          <div className="text-xs">
            <div>Files: {data.workspace.memoryFiles}</div>
            <div className="truncate">Commit: {data.workspace.lastCommit}</div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="text-lg font-bold mb-1">System</div>
          <div className="text-xs text-[var(--color-text-dim)] mb-2">RESOURCES</div>
          <div className="space-y-2">
            <ProgressBar value={data.system.cpuPercent} label="CPU" />
            <ProgressBar value={data.system.memoryPercent} label="Memory" />
            <ProgressBar value={data.system.diskPercent} label="Disk" />
          </div>
        </div>
      </div>

      {/* Channels List */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-dim)] uppercase tracking-wide">
          Channels
        </h3>
        <div className="space-y-2">
          {Object.entries(data.channels).map(([name, channel]) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  channel.status === 'connected' || channel.status === 'ok' ? 'bg-green' :
                  channel.status === 'warning' ? 'bg-yellow' :
                  channel.status === 'error' || channel.status === 'failed' ? 'bg-red' :
                  'bg-[var(--color-border)]'
                }`}></div>
                <span className="text-sm">{name}</span>
              </div>
              <div className="text-right text-xs">
                <div className={`${getStatusColor(channel.status)}`}>{channel.status}</div>
                {channel.lastMessage && (
                  <div className="text-[var(--color-text-dim)] max-w-[200px] truncate">
                    {channel.lastMessage}
                  </div>
                )}
                {channel.note && (
                  <div className="text-[var(--color-text-dim)] italic max-w-[200px] truncate">
                    {channel.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}