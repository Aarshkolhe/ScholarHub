import { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock, Award, AlertCircle, Volume2, UserCheck, FileText } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("scholarhub_token");
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (userNotifId) => {
    const token = localStorage.getItem("scholarhub_token");
    try {
      await fetch(`${BACKEND_URL}/api/notifications/${userNotifId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("scholarhub_token");
    try {
      await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "profile_reminder":
        return <UserCheck size={16} className="text-amber-500" />;
      case "document_reminder":
        return <FileText size={16} className="text-purple-500" />;
      case "new_scholarship":
        return <Award size={16} className="text-blue-500" />;
      case "deadline_reminder":
        return <Clock size={16} className="text-rose-500" />;
      default:
        return <Volume2 size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        title="In-App Notifications"
        aria-label="Open notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-50 text-slate-800 dark:text-slate-200 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Check size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 my-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.isRead;
                return (
                  <div
                    key={n.userNotificationId || n.notificationId}
                    className={`py-3 px-2 flex gap-3 items-start transition-colors rounded-xl ${
                      isUnread ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      {n.senderName && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          From: {n.senderName}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(n.userNotificationId || n.notificationId)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
