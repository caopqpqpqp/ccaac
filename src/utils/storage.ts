import { EventItem } from '../types';

const STORAGE_KEY = 'time-memorial-events';

export function loadEvents(): EventItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: EventItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
