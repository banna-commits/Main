'use client';

import { ActivityData } from '@/types';

export default function ActivityTab({ data }: { data: ActivityData | null }) {
  if (!data || !data.events.length) {
    return (
      <div className="text-center py-8 text-[var(--color-text-dim)]">
        <div className="text-2xl mb-2">📡</div>
        <div>No activity data available</div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-[var(--color-accent)]';
      case 'success': return 'border-green';
      case 'warning': return 'border-yellow';
      case 'error': return 'border-red';
      default: return 'border-[var(--color-border)]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const formatRelativeTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'nå';
    if (minutes < 60) return `${minutes}m siden`;
    if (hours < 24) return `${hours}t siden`;
    if (days < 7) return `${days}d siden`;
    
    return date.toLocaleDateString('no-NO', { month: 'short', day: 'numeric' });
  };

  // Show max 50 items, most recent first
  const events = data.events.slice(0, 50);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2">
            <div className="text-lg font-bold">{data.events.length}</div>
            <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wide">Total Events</div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2">
            <div className="text-lg font-bold">{data.events.filter(e => e.type === 'error').length}</div>
            <div className="text-xs text-red uppercase tracking-wide">Errors</div>
          </div>
        </div>
        <div className="text-xs text-[var(--color-text-dim)]">
          Updated: {new Date(data.lastUpdated).toLocaleString('no-NO')}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg max-h-[600px] overflow-y-auto">
        {events.map((event, index) => (
          <div 
            key={`${event.time}-${index}`} 
            className={`border-l-4 ${getTypeColor(event.type)} p-4 ${
              index < events.length - 1 ? 'border-b border-[var(--color-border)]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{event.icon || getTypeIcon(event.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-relaxed">{event.text}</div>
                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-dim)]">
                  <span>{new Date(event.time).toLocaleString('no-NO')}</span>
                  <span className="text-[var(--color-accent)]">{formatRelativeTime(event.time)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}