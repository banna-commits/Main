'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TasksData, ScheduleData, InvestmentsData, MemoryData } from '@/types';
import TasksTab from '@/components/TasksTab';
import ActionTab from '@/components/ActionTab';
import ScheduleTab from '@/components/ScheduleTab';
import CalendarTab from '@/components/CalendarTab';
import InvestmentsTab from '@/components/InvestmentsTab';
import MemoryTab from '@/components/MemoryTab';

const TABS = [
  { id: 'tasks', label: '📋 Tasks' },
  { id: 'schedule', label: '📅 Schedule' },
  { id: 'calendar', label: '🗓 Calendar' },
  { id: 'investments', label: '📈 Investments' },
  { id: 'action', label: '⚡ Trenger Knut' },
  { id: 'memory', label: '🧠 Memory' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [updated, setUpdated] = useState('');
  const [tasks, setTasks] = useState<TasksData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [investments, setInvestments] = useState<InvestmentsData | null>(null);
  const [memory, setMemory] = useState<MemoryData | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [t, s, m] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/schedule').then(r => r.json()),
        fetch('/api/memory').then(r => r.json()),
      ]);
      setTasks(t);
      setSchedule(s);
      setMemory(m);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[22px] font-semibold">
          ⚡ Mission Control — <span className="text-accent">Banna &amp; Knut</span>
        </h1>
        <div className="text-text-dim text-xs">{updated}</div>
      </div>

      <div className="flex gap-0.5 mb-5 border-b border-border">
        {TABS.map(tab => (
          <div
            key={tab.id}
            className={`px-5 py-2.5 text-sm font-medium cursor-pointer border-b-2 transition-all ${
              activeTab === tab.id
                ? 'text-accent border-accent'
                : 'text-text-dim border-transparent hover:text-text'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className={activeTab === 'tasks' ? '' : 'hidden'}><TasksTab data={tasks} /></div>
      <div className={activeTab === 'schedule' ? '' : 'hidden'}><ScheduleTab data={schedule} /></div>
      <div className={activeTab === 'calendar' ? '' : 'hidden'}><CalendarTab data={schedule} /></div>
      <div className={activeTab === 'investments' ? '' : 'hidden'}><InvestmentsTab data={investments} /></div>
      <div className={activeTab === 'action' ? '' : 'hidden'}><ActionTab data={tasks} /></div>
      <div className={activeTab === 'memory' ? '' : 'hidden'}><MemoryTab data={memory} /></div>
    </div>
  );
}
