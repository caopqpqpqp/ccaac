import { useState, useEffect, useCallback } from 'react';
import { EventItem, TabType } from './types';
import { loadEvents, saveEvents } from './utils/storage';
import { requestNotificationPermission, checkNotifications } from './utils/notifications';
import { getTodayLunar, getTodaySolar, getNextLunarDate, solarToLunar } from './utils/lunar';
import EventCard from './components/EventCard';
import AddEventModal from './components/AddEventModal';

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

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load events from storage
  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  // Request notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Check notifications periodically
  useEffect(() => {
    const check = () => {
      const eventsWithDates = events.map(e => ({
        ...e,
        targetDate: getTargetDate(e),
      }));
      checkNotifications(eventsWithDates);
    };
    
    check();
    const interval = setInterval(check, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [events]);

  // Save events when they change
  useEffect(() => {
    if (events.length > 0 || localStorage.getItem('time-memorial-events')) {
      saveEvents(events);
    }
  }, [events]);

  const handleAddEvent = useCallback((event: EventItem) => {
    setEvents(prev => {
      const existing = prev.findIndex(e => e.id === event.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = event;
        return updated;
      }
      return [...prev, event];
    });
    setEditEvent(null);
  }, []);

  const handleEditEvent = useCallback((event: EventItem) => {
    setEditEvent(event);
    setShowModal(true);
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setShowDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showDeleteConfirm) {
      setEvents(prev => prev.filter(e => e.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm]);

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      if (activeTab === 'countdown') return event.type === 'countdown';
      if (activeTab === 'anniversary') return event.type === 'anniversary';
      return true;
    })
    .filter(event => {
      if (!searchQuery) return true;
      return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             event.note.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = getTargetDate(a);
      const dateB = getTargetDate(b);
      const daysA = getDaysRemaining(dateA);
      const daysB = getDaysRemaining(dateB);
      
      // Today's events first
      if (daysA === 0 && daysB !== 0) return -1;
      if (daysB === 0 && daysA !== 0) return 1;
      
      // Future events sorted by nearest
      if (daysA >= 0 && daysB >= 0) return daysA - daysB;
      
      // Past events sorted by most recent
      return daysB - daysA;
    });

  // Stats
  const todayEvents = events.filter(e => getDaysRemaining(getTargetDate(e)) === 0).length;
  const upcomingEvents = events.filter(e => {
    const days = getDaysRemaining(getTargetDate(e));
    return days > 0 && days <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                时光纪念
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getTodaySolar()} · {getTodayLunar()}
              </p>
            </div>
            <button
              onClick={() => { setEditEvent(null); setShowModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              添加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Stats Cards */}
        {(todayEvents > 0 || upcomingEvents > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {todayEvents > 0 && (
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-3 text-white shadow-lg shadow-amber-500/20">
                <div className="text-2xl font-black">{todayEvents}</div>
                <div className="text-xs opacity-90">今日事件</div>
              </div>
            )}
            {upcomingEvents > 0 && (
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-3 text-white shadow-lg shadow-blue-500/20">
                <div className="text-2xl font-black">{upcomingEvents}</div>
                <div className="text-xs opacity-90">本周即将到来</div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索事件..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { key: 'all', label: '全部', icon: '📋' },
            { key: 'countdown', label: '倒计时', icon: '⏳' },
            { key: 'anniversary', label: '纪念日', icon: '🎂' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {searchQuery ? '🔍' : '📅'}
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
              {searchQuery ? '没有找到匹配的事件' : '还没有添加事件'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? '试试其他关键词' : '点击右下角按钮添加倒计时或纪念日'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => { setEditEvent(null); setShowModal(true); }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
              >
                添加第一个事件
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => { setEditEvent(null); setShowModal(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 sm:hidden"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditEvent(null); }}
        onAdd={handleAddEvent}
        editEvent={editEvent}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">确认删除</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                删除后将无法恢复，确定要删除这个事件吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
