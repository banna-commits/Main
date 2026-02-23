'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, TasksData } from '@/types';

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

const STATUS_OPTIONS = COLUMNS.map(c => ({ value: c.id, label: c.label }));
const PRIORITY_OPTIONS = [
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

// --- API helpers ---
async function patchTask(id: string, updates: Partial<Task>) {
  const res = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  return res.json();
}

async function deleteTask(id: string) {
  const res = await fetch('/api/tasks', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

async function sendTask(taskId: string, title: string) {
  const res = await fetch('/api/tasks/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, title }),
  });
  return res.json();
}

// --- Task Modal ---
function TaskModal({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const dirty = title !== task.title || description !== (task.description || '') ||
    status !== task.status || priority !== (task.priority || 'medium');

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    await onUpdate(task.id, { title, description: description || undefined, status, priority });
    setSaving(false);
  };

  const handleDone = async () => {
    setSaving(true);
    await onUpdate(task.id, { title, description: description || undefined, status: 'done', priority });
    setSaving(false);
    onClose();
  };

  const handleSend = async () => {
    await sendTask(task.id, title);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete(task.id);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-xs text-text-dim font-mono">{task.id}</span>
          <button onClick={onClose} className="text-text-dim hover:text-text text-lg leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold text-text border-b border-transparent focus:border-accent outline-none pb-1 transition-colors"
            placeholder="Task title"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-dim resize-none outline-none focus:border-accent transition-colors min-h-[80px]"
            placeholder="Description (optional)"
          />

          {/* Status + Priority row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-text-dim uppercase tracking-wider mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-text-dim uppercase tracking-wider mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tags (read-only for now) */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {task.tags.map(tg => (
                <span key={tg} className={`text-[11px] px-2 py-0.5 rounded ${TAG_STYLES[tg] || 'bg-border text-text-dim'}`}>{tg}</span>
              ))}
            </div>
          )}

          {task.blockedReason && (
            <div className="text-xs text-red bg-red/10 rounded-lg px-3 py-2">⚠ {task.blockedReason}</div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3.5 border-t border-border flex flex-wrap gap-2">
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-accent text-bg text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Lagrer...' : 'Lagre'}
            </button>
          )}

          {status !== 'done' && (
            <button
              onClick={handleDone}
              className="px-4 py-2 bg-green/20 text-green text-sm font-semibold rounded-lg hover:bg-green/30 transition-colors"
            >
              ✓ Done
            </button>
          )}

          <button
            onClick={handleSend}
            className="px-4 py-2 bg-accent/20 text-accent text-sm font-semibold rounded-lg hover:bg-accent/30 transition-colors"
          >
            {sent ? '✓ Sendt!' : '⚡ Jobbe med'}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleDelete}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              confirmDelete
                ? 'bg-red text-white hover:bg-red/80'
                : 'bg-red/10 text-red hover:bg-red/20'
            }`}
          >
            {confirmDelete ? 'Bekreft slett' : '🗑 Slett'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main TasksTab ---
export default function TasksTab({ data, onRefresh }: { data: TasksData | null; onRefresh?: () => void }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    await patchTask(id, updates);
    onRefresh?.();
    // Update selected task in place
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    onRefresh?.();
    setSelectedTask(null);
  };

  return (
    <div>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

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
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="bg-bg border border-border rounded-lg p-[11px] mb-2 hover:border-accent transition-colors cursor-pointer active:scale-[0.98]"
                >
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
