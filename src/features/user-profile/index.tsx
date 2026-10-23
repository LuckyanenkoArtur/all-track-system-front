import { useCallback, useState } from "react";
import { FiUser, FiSettings, FiMonitor, FiLink } from "react-icons/fi";
import BioTab from "./user-page/BioTab";
import SettingsTab from "./user-page/SettingsTab";
import DevicesTab from "./user-page/DevicesTab";
import IntegrationsTab from "./user-page/IntegrationsTab";
import { ConfirmDialog } from "./components/dialogs/Dialog";
import { useTranslation } from "../../i18n";
import "./UserPage.scss";

type TabId = "bio" | "settings" | "devices" | "integrations";

const tabs: { id: TabId; icon: typeof FiUser }[] = [
  { id: "bio", icon: FiUser },
  { id: "settings", icon: FiSettings },
  { id: "devices", icon: FiMonitor },
  { id: "integrations", icon: FiLink },
];

export default function UserProfilePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("bio");
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);
  const [bioDirty, setBioDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const tabLabels: Record<TabId, string> = {
    bio: t.userPage.tabs.bio,
    settings: t.userPage.tabs.settings,
    devices: t.userPage.tabs.devices,
    integrations: t.userPage.tabs.integrations,
  };

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;
      if (activeTab === "bio" && bioDirty) {
        setPendingTab(tab);
        setShowUnsavedDialog(true);
        return;
      }
      setActiveTab(tab);
    },
    [activeTab, bioDirty],
  );

  const confirmTabChange = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setBioDirty(false);
      setPendingTab(null);
    }
    setShowUnsavedDialog(false);
  };

  return (
    <div className="user-page">
      <header className="user-page__header">
        <p className="user-page__subtitle">{t.userPage.subtitle}</p>
      </header>

      <div className="user-page__layout">
        <nav className="user-page__tabs" role="tablist">
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`user-page__tab${activeTab === id ? " user-page__tab--active" : ""}`}
              onClick={() => handleTabChange(id)}
            >
              <Icon className="user-page__tab-icon" />
              <span className="user-page__tab-label">{tabLabels[id]}</span>
            </button>
          ))}
        </nav>

        <div className="user-page__panel" role="tabpanel">
          <div
            key={activeTab}
            className="user-page__panel-inner user-page__panel-inner--enter"
          >
            {activeTab === "bio" && (
              <BioTab isDirty={bioDirty} onDirtyChange={setBioDirty} />
            )}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "devices" && <DevicesTab />}
            {activeTab === "integrations" && <IntegrationsTab />}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showUnsavedDialog}
        onClose={() => {
          setShowUnsavedDialog(false);
          setPendingTab(null);
        }}
        onConfirm={confirmTabChange}
        title={t.userPage.bio.unsavedTitle}
        message={t.userPage.bio.unsavedMessage}
        confirmLabel={t.common.continue}
        cancelLabel={t.common.cancel}
        variant="danger"
      />
    </div>
  );
}
