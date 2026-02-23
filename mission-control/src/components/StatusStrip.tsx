'use client';

import { SystemHealth, TasksData, ScheduleData } from '@/types';

interface StatusStripProps {
  systemHealth: SystemHealth | null;
  tasks: TasksData | null;
  schedule: ScheduleData | null;
}

export default function StatusStrip({ systemHealth, tasks, schedule }: StatusStripProps) {
  if (!systemHealth || !tasks || !schedule) return null;

  const gatewayStatus = systemHealth.gateway.status;
  const activeTasksCount = tasks.tasks.filter(t => t.status === 'in-progress').length;
  const blockedTasksCount = tasks.tasks.filter(t => t.status === 'blocked').length;
  const cronErrors = systemHealth.cron.error;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'ok': return 'bg-green';
      case 'warning': return 'bg-yellow';
      case 'error':
      case 'failed': return 'bg-red';
      default: return 'bg-[var(--color-border)]';
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 mb-4 flex items-center gap-6 text-sm">
      {/* Gateway Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(gatewayStatus)}`}></div>
        <span className="text-[var(--color-text-dim)]">Gateway</span>
      </div>

      {/* Channel Status */}
      <div className="flex items-center gap-2">
        {Object.entries(systemHealth.channels).map(([name, channel]) => (
          <div key={name} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(channel.status)}`}></div>
            <span className="text-[var(--color-text-dim)] text-xs">{name}</span>
          </div>
        ))}
      </div>

      {/* Tasks Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[var(--color-text-dim)]">Active:</span>
          <span className="text-[var(--color-accent)]">{activeTasksCount}</span>
        </div>
        {blockedTasksCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[var(--color-text-dim)]">Blocked:</span>
            <span className="text-red">{blockedTasksCount}</span>
          </div>
        )}
      </div>

      {/* Cron Errors */}
      {cronErrors > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-[var(--color-text-dim)]">Cron Errors:</span>
          <span className="text-red">{cronErrors}</span>
        </div>
      )}
    </div>
  );
}