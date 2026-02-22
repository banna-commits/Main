'use client';

import { useState, useMemo } from 'react';
import { MemoryData, MemoryFile } from '@/types';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMd(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => `<pre><code>${esc(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<strong>$2</strong>')
    .replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/#(\w+)/g, '<code>#$1</code>')
    .replace(/^(?!<[hlupob]|<li|<hr|<pre|<block)(.+)$/gm, '<p>$1</p>');
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');
  return html;
}

const TYPE_LABELS: Record<string, string> = {
  longterm: '🧠 Long-Term Memory',
  daily: '📝 Daily Logs',
  reference: '📄 Reference',
};

const TYPE_BADGE: Record<string, string> = {
  longterm: 'bg-[#3f2a1a] text-yellow',
  daily: 'bg-[#1a2a3f] text-accent',
  reference: 'bg-[#2a1f3f] text-purple',
};

export default function MemoryTab({ data }: { data: MemoryData | null }) {
  const [query, setQuery] = useState('');
  const [activePath, setActivePath] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!query) return data.files;
    const q = query.toLowerCase();
    return data.files
      .filter(f =>
        f.content.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        (f.sections || []).some(s => s.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const ca = (a.content.match(re) || []).length;
        const cb = (b.content.match(re) || []).length;
        return cb - ca;
      });
  }, [data, query]);

  const groups = useMemo(() => {
    const g: Record<string, MemoryFile[]> = { longterm: [], daily: [], reference: [] };
    filtered.forEach(f => (g[f.type] || g.daily).push(f));
    return g;
  }, [filtered]);

  const activeFile = data?.files.find(f => f.path === activePath);

  const bodyHtml = useMemo(() => {
    if (!activeFile) return '';
    let html = renderMd(activeFile.content);
    if (query) {
      const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${q})`, 'gi'), '<span class="bg-yellow text-bg px-0.5 rounded-sm">$1</span>');
    }
    return html;
  }, [activeFile, query]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-[300px_1fr] gap-5 min-h-[70vh] max-[900px]:grid-cols-1">
      {/* Sidebar */}
      <div className="bg-surface border border-border rounded-[10px] p-4 overflow-y-auto max-h-[80vh] max-[900px]:max-h-[40vh]">
        <input
          type="text"
          className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-lg text-text text-[13px] mb-4 outline-none focus:border-accent transition-colors placeholder:text-text-dim"
          placeholder="🔍 Search memories..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="text-[11px] text-text-dim mb-3">
          {query
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
            : `${data.files.length} memory files · ${(data.totalSize / 1024).toFixed(1)} KB`}
        </div>
        {Object.entries(groups).map(([type, items]) => {
          if (!items.length) return null;
          return (
            <div key={type}>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mt-4 mb-2 first:mt-0">
                {TYPE_LABELS[type]}
              </div>
              {items.map(f => (
                <div
                  key={f.path}
                  className={`px-3 py-2.5 rounded-md cursor-pointer mb-0.5 transition-colors hover:bg-bg ${
                    activePath === f.path ? 'bg-bg border-l-[3px] border-accent' : ''
                  }`}
                  onClick={() => setActivePath(f.path)}
                >
                  <div className="text-[13px] font-semibold mb-0.5">
                    {f.name}{' '}
                    <span className={`text-[9px] px-1 py-0.5 rounded ml-1 align-middle ${TYPE_BADGE[f.type] || ''}`}>
                      {f.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-dim">{f.date} · {(f.size / 1024).toFixed(1)} KB</div>
                  {f.sections && f.sections.length > 0 && (
                    <div className="text-[10px] text-accent mt-0.5">{f.sections.slice(0, 4).join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="bg-surface border border-border rounded-[10px] p-6 overflow-y-auto max-h-[80vh]">
        {!activeFile ? (
          <div className="text-center py-16 text-text-dim">
            <div className="text-5xl mb-3">🧠</div>
            <div className="text-sm">Select a memory to view</div>
          </div>
        ) : (
          <>
            <div className="text-xl font-bold mb-1">
              {activeFile.name}{' '}
              <span className={`text-[9px] px-1.5 py-0.5 rounded ml-1.5 align-middle ${TYPE_BADGE[activeFile.type] || ''}`}>
                {activeFile.type}
              </span>
            </div>
            <div className="text-xs text-text-dim mb-5 pb-3 border-b border-border">
              📁 {activeFile.path} · Modified: {new Date(activeFile.modified).toLocaleString('no-NO')} · {(activeFile.size / 1024).toFixed(1)} KB
            </div>
            <div
              className="text-sm leading-relaxed
                [&_h1]:text-xl [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-accent
                [&_h2]:text-[17px] [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-accent [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-1.5
                [&_h3]:text-[15px] [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-purple
                [&_p]:mb-2.5
                [&_ul]:my-2 [&_ul]:ml-5 [&_ol]:my-2 [&_ol]:ml-5
                [&_li]:mb-1 [&_li]:leading-normal
                [&_code]:bg-bg [&_code]:px-1.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-orange
                [&_pre]:bg-bg [&_pre]:p-3.5 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2.5 [&_pre]:border [&_pre]:border-border
                [&_pre_code]:p-0 [&_pre_code]:bg-transparent
                [&_strong]:text-text
                [&_em]:text-text-dim
                [&_blockquote]:border-l-[3px] [&_blockquote]:border-accent [&_blockquote]:pl-3.5 [&_blockquote]:text-text-dim [&_blockquote]:my-2.5
                [&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline
                [&_hr]:border-none [&_hr]:border-t [&_hr]:border-border [&_hr]:my-4"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </>
        )}
      </div>
    </div>
  );
}
