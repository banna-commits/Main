'use client';

import { TasksData } from '@/types';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'text-text-dim' },
  { id: 'in-progress', label: 'In Progress', color: 'text-accent' },
  { id: 'blocked', label: 'Blocked', color: 'text-red' },
  { id: 'done', label: 'Done', color: 'text-green' },
];

const TAG_STYLES: Record<string, string> = {
  investing: 'bg-[#1f3a1f] text-green',
  tooling: 'bg-[#1a2a3f] text-accent',
  infra: 'bg-[#2a1f3f] text-purple',
  taksthjem: 'bg-[#3f2a1a] text-yellow',
  calendar: 'bg-[#1f3a3a] text-[#56d4d4]',
};

const PRIORITY_EMOJI: Record<string, string> = {
  high: '🔴 ',
  medium: '🟡 ',
  low: '🟢 ',
};

export default function TasksTab({ data }: { data: TasksData | null }) {
  if (!data) return null;

  const counts: Record<string, number> = {};
  COLUMNS.forEach(c => counts[c.id] = 0);
  data.tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);

  const stats = [
    { n: data.tasks.length, l: 'Total' },
    { n: counts['in-progress'], l: 'Active' },
    { n: counts['blocked'], l: 'Blocked' },
    { n: counts['done'], l: 'Done' },
  ];

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap">
        {stats.map(s => (
          <div key={s.l} className="bg-surface border border-border rounded-lg px-3.5 py-2.5 min-w-[90px]">
            <div className="text-[22px] font-bold">{s.n}</div>
            <div className="text-[11px] text-text-dim uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[500px]:grid-cols-1">
        {COLUMNS.map(col => {
          const tasks = data.tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-surface border border-border rounded-[10px] p-3.5 min-h-[200px]">
              <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-border">
                <span className={`text-[13px] font-semibold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                <span className="bg-border rounded-[10px] px-2 py-0.5 text-[11px] text-text-dim">{tasks.length}</span>
              </div>
              {!tasks.length ? (
                <div className="text-text-dim text-xs italic text-center py-5">No tasks</div>
              ) : tasks.map(t => (
                <div key={t.id} className="bg-bg border border-border rounded-lg p-[11px] mb-2 hover:border-accent transition-colors">
                  <div className="text-[13px] font-semibold mb-1 leading-tight">
                    <span className="text-[9px]">{PRIORITY_EMOJI[t.priority || 'medium']}</span>
                    {t.title}
                  </div>
                  {t.description && <div className="text-[11px] text-text-dim mb-2 leading-snug">{t.description}</div>}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                      {(t.tags || []).map(tg => (
                        <span key={tg} className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_STYLES[tg] || 'bg-border text-text-dim'}`}>{tg}</span>
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[10px] whitespace-nowrap ${
                      t.assignee === 'anna' ? 'bg-[#1a2a3f] text-accent' : 'bg-[#2a1f3f] text-purple'
                    }`}>{t.assignee}</span>
                  </div>
                  {t.blockedReason && (
                    <div className="text-[10px] text-red italic mt-1 pt-1 border-t border-dashed border-border">
                      ⚠ {t.blockedReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
