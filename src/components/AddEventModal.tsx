import { useState } from 'react';
import { EventItem } from '../types';
import { generateId } from '../utils/storage';
import { lunarToSolar, getLunarDateString } from '../utils/lunar';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: EventItem) => void;
  editEvent?: EventItem | null;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'
];

export default function AddEventModal({ isOpen, onClose, onAdd, editEvent }: AddEventModalProps) {
  const [title, setTitle] = useState(editEvent?.title || '');
  const [type, setType] = useState<'countdown' | 'anniversary'>(editEvent?.type || 'countdown');
  const [isLunar, setIsLunar] = useState(editEvent?.isLunar || false);
  const [solarDate, setSolarDate] = useState(editEvent?.date || '');
  const [lunarMonth, setLunarMonth] = useState(editEvent?.lunarMonth || 1);
  const [lunarDay, setLunarDay] = useState(editEvent?.lunarDay || 1);
  const [note, setNote] = useState(editEvent?.note || '');
  const [notifyEnabled, setNotifyEnabled] = useState(editEvent?.notifyEnabled ?? true);
  const [notifyDays, setNotifyDays] = useState<number[]>(editEvent?.notifyDays || [0, 1, 7]);
  const [color, setColor] = useState(editEvent?.color || COLORS[Math.floor(Math.random() * COLORS.length)]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    let date = solarDate;
    if (isLunar) {
      const today = new Date();
      const solarDateObj = lunarToSolar(today.getFullYear(), lunarMonth, lunarDay);
      date = solarDateObj.toISOString().split('T')[0];
    }
    
    if (!date && !isLunar) return;

    const event: EventItem = {
      id: editEvent?.id || generateId(),
      title: title.trim(),
      date,
      isLunar,
      lunarMonth: isLunar ? lunarMonth : undefined,
      lunarDay: isLunar ? lunarDay : undefined,
      type,
      note: note.trim(),
      notifyDays,
      notifyEnabled,
      createdAt: editEvent?.createdAt || new Date().toISOString(),
      color,
    };

    onAdd(event);
    onClose();
  };

  const toggleNotifyDay = (day: number) => {
    setNotifyDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editEvent ? '编辑事件' : '添加新事件'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              事件名称 *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：春节、生日、考试..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              事件类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('countdown')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  type === 'countdown'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⏳ 倒计时
              </button>
              <button
                type="button"
                onClick={() => setType('anniversary')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  type === 'anniversary'
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎂 纪念日
              </button>
            </div>
          </div>

          {/* Calendar Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              历法类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsLunar(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !isLunar
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📅 公历
              </button>
              <button
                type="button"
                onClick={() => setIsLunar(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  isLunar
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🌙 农历
              </button>
            </div>
          </div>

          {/* Date Input */}
          {!isLunar ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                目标日期 *
              </label>
              <input
                type="date"
                value={solarDate}
                onChange={e => setSolarDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                农历日期 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">月份</label>
                  <select
                    value={lunarMonth}
                    onChange={e => setLunarMonth(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {lunarMonthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">日期</label>
                  <select
                    value={lunarDay}
                    onChange={e => setLunarDay(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}日</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                当前选择：{getLunarDateString(lunarMonth, lunarDay)}（每年自动计算公历日期）
              </p>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              主题颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              备注
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="添加备注信息..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Notifications */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔔 通知提醒
              </label>
              <button
                type="button"
                onClick={() => setNotifyEnabled(!notifyEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifyEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifyEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {notifyEnabled && (
              <div className="flex flex-wrap gap-2">
                {[0, 1, 3, 7, 14, 30].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleNotifyDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      notifyDays.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500'
                    }`}
                  >
                    {day === 0 ? '当天' : `${day}天前`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
          >
            {editEvent ? '保存修改' : '添加事件'}
          </button>
        </form>
      </div>
    </div>
  );
}
