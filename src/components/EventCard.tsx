import { EventItem } from '../types';
import { getNextLunarDate, getLunarDateString, solarToLunar } from '../utils/lunar';

interface EventCardProps {
  event: EventItem;
  onEdit: (event: EventItem) => void;
  onDelete: (id: string) => void;
}

function getTargetDate(event: EventItem): Date {
  if (event.isLunar && event.lunarMonth && event.lunarDay) {
    return getNextLunarDate(event.lunarMonth, event.lunarDay);
  }
  return new Date(event.date + 'T00:00:00');
}

function getDaysRemaining(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysPassed(targetDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const targetDate = getTargetDate(event);
  const daysRemaining = getDaysRemaining(targetDate);
  const daysPassed = getDaysPassed(targetDate);
  const isToday = daysRemaining === 0;
  const isPast = daysRemaining < 0;

  const lunarInfo = event.isLunar && event.lunarMonth && event.lunarDay
    ? getLunarDateString(event.lunarMonth, event.lunarDay)
    : null;

  const solarLunar = solarToLunar(new Date(event.date + 'T00:00:00'));
  const solarLunarStr = event.isLunar ? null : `${solarLunar.monthName}月${solarLunar.dayName}`;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: event.color }} />
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {event.type === 'countdown' ? '⏳' : '🎂'}
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                {event.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {event.isLunar ? '🌙' : '📅'} {event.isLunar ? lunarInfo : formatDate(targetDate)}
              </span>
              {solarLunarStr && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({solarLunarStr})
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(event)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="text-center py-3">
          {event.type === 'countdown' ? (
            <>
              {isToday ? (
                <div className="space-y-1">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-500">
                    🎉 就是今天！
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(targetDate)}
                  </p>
                </div>
              ) : isPast ? (
                <div className="space-y-1">
                  <div className="text-3xl font-black text-gray-400 dark:text-gray-500">
                    已过期
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    已过去 {Math.abs(daysRemaining)} 天
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-4xl font-black" style={{ color: event.color }}>
                    {daysRemaining}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    天后
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(targetDate)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {isToday ? (
                <div className="space-y-1">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                    🎂 今天！
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(targetDate)}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-4xl font-black" style={{ color: event.color }}>
                    {daysRemaining > 0 ? daysRemaining : Math.abs(daysRemaining)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {daysRemaining > 0 ? '天后到来' : '天前已过'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    距今已 {daysPassed > 0 ? daysPassed : 0} 天
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Note */}
        {event.note && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              📝 {event.note}
            </p>
          </div>
        )}

        {/* Notification badge */}
        {event.notifyEnabled && event.notifyDays.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-blue-500 dark:text-blue-400">🔔</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              已开启提醒
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
