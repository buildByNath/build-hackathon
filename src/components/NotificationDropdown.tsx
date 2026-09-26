import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Flame, Target, ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react';
import { usePriceWatch } from '../context/PriceWatchContext';
import type { NotificationItem } from '../types';


export default function NotificationDropdown() {
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead, setActiveProductId } = usePriceWatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'price_drop':
        return <Flame size={16} className="text-orange-500" />;
      case 'target_reached':
        return <Target size={16} className="text-emerald-500" />;
      case 'alternative_found':
        return <Sparkles size={16} className="text-blue-500" />;
      case 'price_increased':
        return <ArrowUpRight size={16} className="text-amber-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-600 hover:text-gray-900"
        aria-label="Notification center"
      >
        <Bell size={20} />
        {unreadNotifCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
            {unreadNotifCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden border border-gray-100">
          <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {unreadNotifCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadNotifCount} new
                </span>
              )}
            </div>
            {unreadNotifCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications yet. Price drops will show up here!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.productId) setActiveProductId(n.productId);
                  }}
                  className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${
                    !n.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 h-fit flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    {n.badge && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {n.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">
              ⚡ Real-time price monitor active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
