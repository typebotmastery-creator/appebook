import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppNotification } from '../types';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkAsRead: (ids: number[]) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkAsRead, onClose }) => {
  const unreadNotifications = notifications.filter(n => !n.is_read);

  const handleMarkAllAsRead = () => {
    const unreadIds = unreadNotifications.map(n => n.id);
    if (unreadIds.length > 0) {
      onMarkAsRead(unreadIds);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-lg border z-20"
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Notificações</h3>
        {unreadNotifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2" />
            <p>Nenhuma notificação ainda.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b last:border-b-0 ${!notification.is_read ? 'bg-purple-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {notification.type === 'achievement' && notification.metadata?.medal_icon && (
                  <span className="text-2xl mt-1">{notification.metadata.medal_icon}</span>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{notification.title}</p>
                  <p className="text-gray-600 text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
