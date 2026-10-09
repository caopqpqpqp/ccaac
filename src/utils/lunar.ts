import { Solar, Lunar } from 'lunar-javascript';

// Convert lunar date to solar (Gregorian) date for a given year
export function lunarToSolar(year: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): Date {
  try {
    const lunar = Lunar.fromYmd(year, lunarMonth, lunarDay);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch {
    // If the lunar date doesn't exist for this year, try next day
    const lunar = Lunar.fromYmd(year, lunarMonth, 1);
    const solar = lunar.getSolar();
    return new Date(solar.getYear(), solar.getMonth() - 1, Math.min(lunarDay, 28));
  }
}

// Convert solar date to lunar date
export function solarToLunar(date: Date): { year: number; month: number; day: number; monthName: string; dayName: string } {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    monthName: lunar.getMonthInChinese(),
    dayName: lunar.getDayInChinese(),
  };
}

// Get the next occurrence of a lunar date (month/day) from today
export function getNextLunarDate(lunarMonth: number, lunarDay: number): Date {
  const today = new Date();
  const todayLunar = solarToLunar(today);
  
  // Try this year first
  let targetDate = lunarToSolar(todayLunar.year, lunarMonth, lunarDay);
  
  if (targetDate.getTime() < today.setHours(0, 0, 0, 0)) {
    // Try next year
    targetDate = lunarToSolar(todayLunar.year + 1, lunarMonth, lunarDay);
  }
  
  return targetDate;
}

// Get lunar date display string
export function getLunarDateString(lunarMonth: number, lunarDay: number): string {
  try {
    const lunar = Lunar.fromYmd(2024, lunarMonth, lunarDay);
    return `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  } catch {
    return `农历${lunarMonth}月${lunarDay}日`;
  }
}

// Get the Chinese zodiac for a year
export function getZodiac(year: number): string {
  const lunar = Lunar.fromYmd(year, 1, 1);
  return lunar.getYearShengXiao();
}

// Get today's lunar date string
export function getTodayLunar(): string {
  const today = new Date();
  const solar = Solar.fromDate(today);
  const lunar = solar.getLunar();
  return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

// Get today's solar date string
export function getTodaySolar(): string {
  const today = new Date();
  return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
}
