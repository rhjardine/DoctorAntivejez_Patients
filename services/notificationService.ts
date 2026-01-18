export const notificationService = {
  // Check if browser supports notifications
  isSupported: (): boolean => {
    return 'Notification' in window;
  },

  // Check current permission status
  getPermission: (): NotificationPermission => {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  // Request permission from user
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  },

  // Send a notification
  send: (title: string, body: string, tag?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      // Check if service worker is available (for mobile PWA support) or fall back to standard
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: '/icon-192x192.png', // Assuming pwa icon exists, or browser default
            tag, // Tag prevents duplicate notifications
            vibrate: [200, 100, 200],
            badge: '/badge-72x72.png'
          } as any);
        });
      } else {
        // Standard Desktop/Simple implementation
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', // Generic pill icon
          tag,
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
};