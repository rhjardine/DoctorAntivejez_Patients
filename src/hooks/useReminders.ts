
import { useState, useEffect } from 'react';
import { PatientProtocol, TimeSlot } from '../types';
import { notificationService } from '../services/notificationService';

const REMINDER_STORAGE_KEY = 'rejuvenate_reminders_log';

interface ReminderLog {
  date: string; // YYYY-MM-DD
  slotsSent: TimeSlot[];
}

export const useReminders = (items: PatientProtocol[]) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load initial state
  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(notificationService.getPermission());
      const storedEnabled = localStorage.getItem('notifications_enabled') === 'true';
      setNotificationsEnabled(storedEnabled);
    }
  }, []);

  // Request Permission Wrapper
  const enableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      setNotificationsEnabled(true);
      localStorage.setItem('notifications_enabled', 'true');
      notificationService.send(
        'Recordatorios Activados', 
        'Te avisaremos cuando sea hora de tus suplementos y terapias.'
      );
    } else {
      setNotificationsEnabled(false);
    }
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    localStorage.setItem('notifications_enabled', 'false');
  };

  // Helper to get pending items count for a slot
  const getPendingCount = (slot: TimeSlot) => {
    return items.filter(i => (i.timeSlot === slot || i.timeSlot === 'ANYTIME') && i.status !== 'completed').length;
  };

  // Main Scheduler Logic
  useEffect(() => {
    if (!notificationsEnabled || permission !== 'granted') return;

    const checkTimeAndNotify = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];

      // Retrieve log
      const logRaw = localStorage.getItem(REMINDER_STORAGE_KEY);
      let log: ReminderLog = logRaw ? JSON.parse(logRaw) : { date: todayStr, slotsSent: [] };

      // Reset log if it's a new day
      if (log.date !== todayStr) {
        log = { date: todayStr, slotsSent: [] };
      }

      // Define Windows (24h format)
      // Morning: 8 AM - 11 AM
      // Afternoon: 1 PM (13) - 4 PM (16)
      // Evening: 8 PM (20) - 11 PM (23)
      
      let targetSlot: TimeSlot | null = null;

      if (currentHour >= 8 && currentHour < 12) targetSlot = 'MORNING';
      else if (currentHour >= 13 && currentHour < 17) targetSlot = 'AFTERNOON';
      else if (currentHour >= 20 && currentHour < 23) targetSlot = 'EVENING';

      if (targetSlot && !log.slotsSent.includes(targetSlot)) {
        const pending = getPendingCount(targetSlot);
        
        if (pending > 0) {
          let title = '';
          let body = '';

          if (targetSlot === 'MORNING') {
            title = '☀️ Rutina de Mañana';
            body = `Tienes ${pending} elementos pendientes para empezar el día.`;
          } else if (targetSlot === 'AFTERNOON') {
            title = '🌤️ Refuerzo de Tarde';
            body = `Es hora de tus ${pending} suplementos y hábitos de la tarde.`;
          } else if (targetSlot === 'EVENING') {
            title = '🌙 Preparación para Dormir';
            body = `No olvides tus ${pending} pasos de la rutina nocturna.`;
          }

          // Send Notification
          notificationService.send(title, body, `reminder-${todayStr}-${targetSlot}`);

          // Update Log
          log.slotsSent.push(targetSlot);
          localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(log));
        }
      }
    };

    // Check immediately on mount, then every minute
    checkTimeAndNotify();
    const interval = setInterval(checkTimeAndNotify, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [notificationsEnabled, permission, items]);

  // Test function for UI
  const sendTestNotification = () => {
    notificationService.send(
      '🔔 Prueba de Notificación',
      'El sistema de recordatorios funciona correctamente.',
      'test-notification'
    );
  };

  return {
    permission,
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    sendTestNotification
  };
};
