import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { FaDiscord, FaHome, FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./side-panel.scss";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useState } from "react";

export default function SidePanel() {
  const [open, setOpen] = useState(true);
  const { user, logOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className={`side-panel ${open ? "open" : ""}`}>
      <header className="side-panel-header">
        {open && (
          <div className="logo-section">
            <img src="/logo.png" alt="FormFlux Logo" className="logo" />
          </div>
        )}
        <button className="toggle-button" onClick={() => setOpen(!open)}>
          {open ? (
            <RiSidebarFoldLine />
          ) : (
            <RiSidebarUnfoldLine />
          )}
        </button>
      </header>

      {open && (
        <div className="side-panel-content">
          <nav className="navigation">
            <div className="nav-section">
              <div className="section-header">Main</div>
              <ul className="nav-list">
                <li className="nav-item active">
                  <FaHome className="nav-icon" />
                  <span className="nav-text">Home</span>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <div className="section-header">Settings</div>
              <ul className="nav-list">
                <li className="nav-item">
                  <FaCog className="nav-icon" />
                  <span className="nav-text">Account</span>
                </li>
              </ul>
            </div>
          </nav>

          <div className="user-section">
            <div className="user-profile">
              <div className="user-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.displayName || "User"}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
            <button className="sign-out-button" onClick={handleSignOut}>
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}