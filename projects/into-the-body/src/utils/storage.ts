import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_DAYS_KEY = 'into_the_body_completed_days';
const SESSION_LOG_KEY = 'into_the_body_sessions';

export interface SessionData {
  date: string;
  day: number;
  bodyZone: string | null;
  sensation: string | null;
  emotion: string | null;
  emotionText?: string;
}

export async function getCompletedDays(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(COMPLETED_DAYS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function markDayComplete(day: number): Promise<void> {
  const days = await getCompletedDays();
  if (!days.includes(day)) {
    days.push(day);
    await AsyncStorage.setItem(COMPLETED_DAYS_KEY, JSON.stringify(days));
  }
}

export async function saveSession(session: SessionData): Promise<void> {
  const raw = await AsyncStorage.getItem(SESSION_LOG_KEY);
  const sessions: SessionData[] = raw ? JSON.parse(raw) : [];
  sessions.push(session);
  await AsyncStorage.setItem(SESSION_LOG_KEY, JSON.stringify(sessions));
}

export async function getCurrentDay(): Promise<number> {
  const days = await getCompletedDays();
  return Math.min(days.length + 1, 7);
}
