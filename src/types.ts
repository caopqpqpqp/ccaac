export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format (stored as Gregorian)
  isLunar: boolean;
  lunarMonth?: number;
  lunarDay?: number;
  type: 'countdown' | 'anniversary';
  note: string;
  notifyDays: number[]; // days before to notify
  notifyEnabled: boolean;
  createdAt: string;
  color: string;
}

export type TabType = 'countdown' | 'anniversary' | 'all';
