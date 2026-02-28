'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from 'react';
import { TasksData, ScheduleData, MemoryData, Task, Job, MemoryFile } from '@/types';

type SearchItem = Task | Job | MemoryFile;

interface SearchResult {
  type: 'task' | 'job' | 'memory';
  title: string;
  description?: string;
  icon: string;
  item: SearchItem;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, item?: SearchItem) => void;
  tasks: TasksData | null;
  schedule: ScheduleData | null;
  memory: MemoryData | null;
}

export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  onNavigate, 
  tasks, 
  schedule, 
  memory 
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const q = query.toLowerCase();

    // Search tasks
    tasks?.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(q) || 
          task.description?.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'task',
          title: task.title,
          description: task.description,
          icon: '📋',
          item: task
        });
      }
    });

    // Search cron jobs
    schedule?.jobs.forEach(job => {
      if (job.name.toLowerCase().includes(q) || 
          job.description.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'job',
          title: job.name,
          description: job.description,
          icon: '📅',
          item: job
        });
      }
    });

    // Search memory files
    memory?.files.forEach(file => {
      if (file.name.toLowerCase().includes(q) || 
          file.content.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'memory',
          title: file.name,
          description: file.path,
          icon: '🧠',
          item: file
        });
      }
    });

    setResults(searchResults.slice(0, 20)); // Limit to 20 results
    setSelectedIndex(0);
  }, [query, tasks, schedule, memory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const result = results[selectedIndex];
      if (result) {
        const tabMap = { task: 'tasks', job: 'schedule', memory: 'memory' };
        onNavigate(tabMap[result.type], result.item);
        onClose();
      }
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    const group = result.type;
    if (!acc[group]) acc[group] = [];
    acc[group].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[20vh]">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg w-full max-w-2xl mx-4 shadow-xl">
        {/* Search Input */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, jobs, memory files..."
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {!query.trim() ? (
            <div className="p-6 text-center text-[var(--color-text-dim)]">
              <div className="text-2xl mb-2">🔍</div>
              <div>Start typing to search...</div>
              <div className="text-xs mt-2">Press Escape to close</div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-text-dim)]">
              <div className="text-2xl mb-2">🚫</div>
              <div>No results found</div>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => (
                <div key={type} className="mb-4 last:mb-0">
                  <div className="text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wide mb-2 px-2">
                    {type === 'task' ? '📋 Tasks' : type === 'job' ? '📅 Jobs' : '🧠 Memory'}
                  </div>
                  {typeResults.map((result, index) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <div
                        key={`${result.type}-${index}`}
                        className={`p-2 rounded cursor-pointer flex items-center gap-3 ${
                          globalIndex === selectedIndex 
                            ? 'bg-[var(--color-accent)] bg-opacity-20 border border-[var(--color-accent)]' 
                            : 'hover:bg-[var(--color-bg)]'
                        }`}
                        onClick={() => {
                          const tabMap = { task: 'tasks', job: 'schedule', memory: 'memory' };
                          onNavigate(tabMap[result.type], result.item);
                          onClose();
                        }}
                      >
                        <span className="text-lg">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{result.title}</div>
                          {result.description && (
                            <div className="text-xs text-[var(--color-text-dim)] truncate">
                              {result.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-dim)] flex justify-between">
            <div>↑↓ Navigate • Enter Select • Escape Close</div>
            <div>{results.length} result{results.length !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>
    </div>
  );
}