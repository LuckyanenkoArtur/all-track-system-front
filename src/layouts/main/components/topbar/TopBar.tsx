import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../../i18n";
import { useUserProfile } from "../../../../context/UserProfileContext";
import { ActiveTrackingCard } from "../../../../features/tasks/components/cards/active-tracking-card/ActiveTrackingCard";
import "./TopBar.scss";

export default function TopBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bio } = useUserProfile();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = 105;
  const notifications = [
    { id: 1, text: "System update completed successfully.", time: "2m ago" },
    { id: 2, text: "New login detected from Opsynta network.", time: "1h ago" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <header className="topbar">
      <div className="search-container">
        <svg
          className="icon search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder={t.common.search}
          className="search-input"
        />
        <kbd className="shortcut">⌘F</kbd>
      </div>

      <div className="actions-container">
        <ActiveTrackingCard
          compact
          labels={{
            title: t.tasks.trackingActive,
            session: t.tasks.session,
            totalTime: t.tasks.totalTime,
            stop: t.tasks.stopTracking,
          }}
        />

        <div className="notification-wrapper" ref={notifRef}>
          <button
            className={`action-btn ${isNotifOpen ? "active" : ""}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && <span className="badge">{displayCount}</span>}
          </button>

          <div className={`dropdown-menu ${isNotifOpen ? "open" : ""}`}>
            <div className="dropdown-header">
              <h3>{t.common.notifications}</h3>
            </div>
            <div className="dropdown-body">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="notif-item">
                    <p className="notif-text">{notif.text}</p>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>{t.common.noNotifications}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          className="user-profile-btn"
          onClick={() => navigate("/app/profile")}
        >
          <img
            src={
              bio.avatarUrl ??
              "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
            }
            alt="User"
            className="avatar"
          />
        </button>
      </div>
    </header>
  );
}
