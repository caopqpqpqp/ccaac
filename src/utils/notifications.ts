export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

export function sendNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: title,
    });
  }
}

export function checkNotifications(events: { id: string; title: string; targetDate: Date; notifyDays: number[]; notifyEnabled: boolean }[]): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  events.forEach(event => {
    if (!event.notifyEnabled) return;
    
    const targetDate = new Date(event.targetDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    event.notifyDays.forEach(daysBefore => {
      if (diffDays === daysBefore) {
        const notifKey = `notif-${event.id}-${daysBefore}-${today.toISOString().split('T')[0]}`;
        if (!localStorage.getItem(notifKey)) {
          localStorage.setItem(notifKey, 'sent');
          if (daysBefore === 0) {
            sendNotification('🎉 今日提醒', `${event.title} 就是今天！`);
          } else {
            sendNotification('⏰ 倒计时提醒', `${event.title} 还有 ${daysBefore} 天`);
          }
        }
      }
    });
  });
}
