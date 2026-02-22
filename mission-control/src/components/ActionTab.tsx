'use client';

import { TasksData } from '@/types';

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

export default function ActionTab({ data }: { data: TasksData | null }) {
  if (!data) return null;

  const tasks = data.tasks.filter(t => t.assignee === 'knut' && t.status === 'blocked');

  return (
    <div>
      <div className="mb-4 text-text-dim text-[13px]">Oppgaver som er blokkert og venter på deg. Gjør disse og ping Anna ⚡</div>
      {!tasks.length ? (
        <div className="text-text-dim text-xs italic text-center py-5">✅ Ingen oppgaver venter på deg!</div>
      ) : tasks.map(t => (
        <div key={t.id} className="bg-bg border border-border rounded-lg p-[11px] mb-2.5 max-w-[600px] hover:border-accent transition-colors">
          <div className="text-[13px] font-semibold mb-1">
            <span className="text-[9px]">{PRIORITY_EMOJI[t.priority || 'medium']}</span>
            {t.title}
          </div>
          {t.description && <div className="text-[11px] text-text-dim mb-2">{t.description}</div>}
          {t.blockedReason && (
            <div className="text-[10px] text-red italic mt-1 pt-1 border-t border-dashed border-border">
              ⚠ {t.blockedReason}
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-1 flex-wrap">
              {(t.tags || []).map(tg => (
                <span key={tg} className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_STYLES[tg] || 'bg-border text-text-dim'}`}>{tg}</span>
              ))}
            </div>
            <span className="text-[10px] text-text-dim">{t.id}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
