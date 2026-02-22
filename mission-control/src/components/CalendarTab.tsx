'use client';

import { useState } from 'react';
import { ScheduleData } from '@/types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function CalendarTab({ data }: { data: ScheduleData | null }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7;

  // Build events from cron jobs
  const events: Record<string, { time: string; name: string; type: string }[]> = {};
  if (data?.jobs) {
    data.jobs.forEach(job => {
      const parts = job.cron.split(' ');
      const mins = parts[0], hours = parts[1].split(',');
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const ds = date.toISOString().slice(0, 10);
        hours.forEach(h => {
          (events[ds] = events[ds] || []).push({
            time: h.padStart(2, '0') + ':' + mins.padStart(2, '0'),
            name: job.name,
            type: job.status === 'error' ? 'error' : 'cron',
          });
        });
      }
    });
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prev} className="bg-surface border border-border text-text px-3.5 py-1.5 rounded-md text-[13px] hover:border-accent cursor-pointer">← Prev</button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={next} className="bg-surface border border-border text-text px-3.5 py-1.5 rounded-md text-[13px] hover:border-accent cursor-pointer">Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-[11px] font-semibold text-text-dim text-center py-2 uppercase">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-surface border border-border rounded-md min-h-[80px] p-1.5 text-[11px] opacity-30" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const date = new Date(year, month, d);
          const ds = date.toISOString().slice(0, 10);
          const isToday = date.getTime() === today.getTime();
          const de = events[ds] || [];
          return (
            <div key={d} onClick={() => setSelectedDay(selectedDay === ds ? null : ds)} className={`bg-surface border rounded-md min-h-[80px] p-1.5 text-[11px] cursor-pointer hover:border-accent transition-colors ${
              selectedDay === ds ? 'border-accent shadow-[0_0_0_2px_var(--color-accent)]' : isToday ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]' : 'border-border'
            }`}>
              <div className="font-semibold text-xs mb-1">{d}</div>
              {de.slice(0, 4).map((e, j) => (
                <div key={j} className={`text-[9px] px-1 py-0.5 rounded mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${
                  e.type === 'error' ? 'bg-[#3f1a1a] text-red' : 'bg-[#1a2a3f] text-accent'
                }`} title={`${e.time} ${e.name}`}>
                  {e.time} {e.name}
                </div>
              ))}
              {de.length > 4 && (
                <div className="text-[9px] px-1 py-0.5 rounded bg-[#1a2a3f] text-accent">+{de.length - 4} more</div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 bg-surface border border-accent rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">{new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <button onClick={() => setSelectedDay(null)} className="text-text-dim hover:text-text text-xs cursor-pointer">✕ Close</button>
          </div>
          {(events[selectedDay] || []).length === 0 ? (
            <p className="text-text-dim text-xs">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {(events[selectedDay] || []).map((e, j) => (
                <div key={j} className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs ${
                  e.type === 'error' ? 'bg-[#3f1a1a] text-red' : 'bg-[#1a2a3f] text-accent'
                }`}>
                  <span className="font-mono font-semibold min-w-[40px]">{e.time}</span>
                  <span>{e.name}</span>
                  <span className="ml-auto text-[10px] opacity-60 uppercase">{e.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
