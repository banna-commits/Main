'use client';

import { ScheduleData } from '@/types';

export default function ScheduleTab({ data }: { data: ScheduleData | null }) {
  if (!data) return null;

  const byDay: Record<string, { time: string; name: string }[]> = {};
  data.upcoming.forEach(e => {
    (byDay[e.date] = byDay[e.date] || []).push(e);
  });

  return (
    <div>
      <div className="mb-6">
        <div className="text-[15px] font-semibold mb-3">⏰ Cron Jobs</div>
        {data.jobs.map(j => (
          <div key={j.name} className="bg-surface border border-border rounded-lg p-3.5 mb-2 flex justify-between items-center hover:border-accent transition-colors">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-0.5">{j.name}</div>
              <div className="text-[11px] text-text-dim">{j.description}</div>
              <div className="text-[11px] text-accent mt-0.5">🕐 {j.schedule}{j.model ? ` · model: ${j.model}` : ''}</div>
            </div>
            <div className="text-right min-w-[100px]">
              <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-[10px] inline-block ${
                j.status === 'ok' ? 'bg-[#1f3a1f] text-green' : 'bg-[#3f1a1a] text-red'
              }`}>{j.status === 'ok' ? '✅ OK' : '❌ Error'}</div>
              {j.statusNote && <div className="text-[10px] text-red mt-0.5">{j.statusNote}</div>}
              <div className="text-[10px] text-text-dim mt-1">
                Next: {new Date(j.nextRun).toLocaleString('no-NO', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-[15px] font-semibold mb-3">📌 Upcoming (Next 48h)</div>
        <div className="mt-4">
          {Object.entries(byDay).map(([date, events]) => (
            <div key={date} className="mb-4">
              <div className="text-[13px] font-semibold text-accent mb-2 pb-1 border-b border-border">
                {new Date(date + 'T12:00:00').toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              {events.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5 text-xs">
                  <span className="text-text-dim font-semibold min-w-[50px] font-mono">{e.time}</span>
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span>{e.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
