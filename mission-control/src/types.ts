export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  tags?: string[];
  assignee: string;
  blockedReason?: string;
}

export interface TasksData {
  tasks: Task[];
}

export interface Job {
  name: string;
  description: string;
  schedule: string;
  cron: string;
  model?: string;
  status: string;
  statusNote?: string;
  nextRun: string;
}

export interface UpcomingEvent {
  date: string;
  time: string;
  name: string;
}

export interface ScheduleData {
  jobs: Job[];
  upcoming: UpcomingEvent[];
}

export interface Asset {
  symbol: string;
  name: string;
  category: string;
  price: number;
  macd: number;
  signal: number;
  histogram: number;
  status: string;
  rsi?: number;
  change7d?: number;
  change30d?: number;
  pe?: number;
  marketCap?: number;
  error?: string;
}

export interface Sentiment {
  current: number;
  previous: number;
  label: string;
}

export interface GlobalData {
  btcDominance: number;
  totalMarketCap: number;
  marketCapChange24h: number;
  totalVolume: number;
}

export interface InvestmentsData {
  sentiment?: Sentiment;
  globalData?: GlobalData;
  assets: Asset[];
  lastUpdated: string;
}

export interface MemoryFile {
  path: string;
  name: string;
  type: string;
  date: string;
  size: number;
  modified: string;
  content: string;
  sections?: string[];
}

export interface MemoryData {
  files: MemoryFile[];
  totalSize: number;
}

export interface SystemHealth {
  lastUpdated: string;
  gateway: { status: string; uptime: string; version: string; pid: number; memoryMB: number };
  channels: Record<string, { status: string; lastMessage?: string; note?: string }>;
  cron: { total: number; ok: number; error: number; lastError?: { job: string; time: string; message: string } };
  workspace: { sizeMB: number; memoryFiles: number; lastCommit: string };
  system: { cpuPercent: number; memoryPercent: number; diskPercent: number };
}

export interface ActivityEvent {
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  text: string;
}

export interface ActivityData {
  lastUpdated: string;
  events: ActivityEvent[];
}
