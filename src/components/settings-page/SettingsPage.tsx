import "./settings-page.scss";
import { useLiveAPIContext } from "../../../src/contexts/LiveAPIContext";
import VoiceSelector from "../settings-dialog/VoiceSelector";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { connected } = useLiveAPIContext();
  const { user } = useAuth();

  return (
    <main className="settings-page">
      <div className={`settings-container ${connected ? "disabled" : ""}`}>
        <header className="settings-header">
          <h1>Settings</h1>
        </header>
        <div className="user-info-container">
          <h3>{user?.displayName}</h3>
          <p>{user?.email}</p>
        </div>
        {connected && (
          <div className="connected-indicator">
            <p>
              Settings cannot be changed while connected. These settings can
              only be applied before connecting and will override other
              settings.
            </p>
          </div>
        )}
        <div className="mode-selectors">
          <VoiceSelector />
        </div>
      </div>
    </main>
  );
}
