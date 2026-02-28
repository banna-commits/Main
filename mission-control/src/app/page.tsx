'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react';
import type { TasksData, ScheduleData, InvestmentsData, MemoryData, SystemHealth, ActivityData, CronLogsData, StateSnapshot, HeartbeatState, Task, Job, MemoryFile } from '@/types';
import TasksTab from '@/components/TasksTab';
import ActionTab from '@/components/ActionTab';
import ScheduleTab from '@/components/ScheduleTab';
import CalendarTab from '@/components/CalendarTab';
import InvestmentsTab from '@/components/InvestmentsTab';
import MemoryTab from '@/components/MemoryTab';
import StatusStrip from '@/components/StatusStrip';
import SystemTab from '@/components/SystemTab';
import ActivityTab from '@/components/ActivityTab';
import CronTab from '@/components/CronTab';
import SearchOverlay from '@/components/SearchOverlay';
import ContextStrip from '@/components/ContextStrip';

const TABS = [
  { id: 'tasks', label: '📋 Tasks' },
  { id: 'schedule', label: '📅 Schedule' },
  { id: 'activity', label: '📡 Activity' },
  { id: 'system', label: '🖥 System' },
  { id: 'calendar', label: '🗓 Calendar' },
  { id: 'investments', label: '📈 Investments' },
  { id: 'action', label: '⚡ Trenger Knut' },
  { id: 'memory', label: '🧠 Memory' },
  { id: 'cron', label: '⏱ Cron' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [updated, setUpdated] = useState('');
  const [tasks, setTasks] = useState<TasksData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [investments, setInvestments] = useState<InvestmentsData | null>(null);
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [cronLogs, setCronLogs] = useState<CronLogsData | null>(null);
  const [stateSnapshot, setStateSnapshot] = useState<StateSnapshot | null>(null);
  const [heartbeatState, setHeartbeatState] = useState<HeartbeatState | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [t, s, m, sh, a, cl, st, hb] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/schedule').then(r => r.json()),
        fetch('/api/memory').then(r => r.json()),
        fetch('/api/system-health').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
        fetch('/api/cron-logs').then(r => r.json()),
        fetch('/api/state').then(r => r.json()),
        fetch('/api/heartbeat').then(r => r.json()),
      ]);
      setTasks(t);
      setSchedule(s);
      setMemory(m);
      setSystemHealth(sh);
      setActivity(a);
      setCronLogs(cl);
      setStateSnapshot(st);
      setHeartbeatState(hb);
      try {
        const inv = await fetch('/api/investments').then(r => r.json());
        setInvestments(inv);
      } catch { /* investments optional */ }
      setUpdated('Updated: ' + new Date().toLocaleString('no-NO'));
    } catch (e) {
      setUpdated('Error: ' + (e as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  type SearchItem = Task | Job | MemoryFile;
  const handleNavigate = (tab: string, _item?: SearchItem) => {
    void _item;
    setActiveTab(tab);
    // Could extend to highlight specific item in the future
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[22px] font-semibold">
          ⚡ Mission Control — <span className="text-accent">Banna &amp; Knut</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-1 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
          >
            🔍 Search (⌘K)
          </button>
          <div className="text-text-dim text-xs">{updated}</div>
        </div>
      </div>

      <StatusStrip systemHealth={systemHealth} tasks={tasks} schedule={schedule} />
      <ContextStrip stateData={stateSnapshot} heartbeatData={heartbeatState} />

      <div className="flex flex-wrap gap-1 mb-5 border-b border-border">
        {TABS.map(tab => {
          return (
            <div
              key={tab.id}
              className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 transition-all relative ${
                activeTab === tab.id
                  ? 'text-accent border-accent'
                  : 'text-text-dim border-transparent hover:text-text'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      <div className={activeTab === 'tasks' ? '' : 'hidden'}><TasksTab data={tasks} onRefresh={refresh} /></div>
      <div className={activeTab === 'schedule' ? '' : 'hidden'}><ScheduleTab data={schedule} /></div>
      <div className={activeTab === 'activity' ? '' : 'hidden'}><ActivityTab data={activity} /></div>
      <div className={activeTab === 'system' ? '' : 'hidden'}><SystemTab data={systemHealth} /></div>
      <div className={activeTab === 'calendar' ? '' : 'hidden'}><CalendarTab data={schedule} /></div>
      <div className={activeTab === 'investments' ? '' : 'hidden'}><InvestmentsTab data={investments} /></div>
      <div className={activeTab === 'action' ? '' : 'hidden'}><ActionTab data={tasks} onRefresh={refresh} /></div>
      <div className={activeTab === 'memory' ? '' : 'hidden'}><MemoryTab data={memory} /></div>
      <div className={activeTab === 'cron' ? '' : 'hidden'}><CronTab data={cronLogs} /></div>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
        tasks={tasks}
        schedule={schedule}
        memory={memory}
      />
    </div>
  );
}
