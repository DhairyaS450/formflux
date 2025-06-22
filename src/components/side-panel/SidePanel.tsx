// Import React icons for UI elements
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { FaHome, FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
// Import component styles
import "./side-panel.scss";
// Import authentication context
import { useAuth } from "../../../src/contexts/AuthContext";
// Import React hooks
import { useState } from "react";
import cn from "classnames";
import Image from "next/image";

// Props interface for the SidePanel component
interface SidePanelProps {
  onSettingsClick: () => void; // Callback function to open settings dialog
  onHomeClick: () => void;
  currentView: "dashboard" | "settings";
}

export default function SidePanel({
  onSettingsClick,
  onHomeClick,
  currentView,
}: SidePanelProps) {
  // State to control whether the side panel is expanded or collapsed
  const [open, setOpen] = useState(true);
  
  // Get user authentication data and logout function from context
  const { user, logOut } = useAuth();

  /**
   * Handle user sign out process
   * Attempts to log out the user and handles any errors
   */
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    // Main side panel container with dynamic classes based on open state
    <div className={`side-panel ${open ? "open" : "collapsed"}`}>
      {/* Header section containing logo and toggle button */}
      <header className="side-panel-header">
        {/* Logo section - only visible when panel is open */}
        <div className="logo-section">
          <Image src="/logo.png" alt="FormFlux Logo" width={120} height={32} className="logo" />
        </div>
        
        {/* Toggle button to expand/collapse the panel */}
        <button className="toggle-button" onClick={() => setOpen(!open)}>
          {open ? (
            <RiSidebarFoldLine />
          ) : (
            <RiSidebarUnfoldLine />
          )}
        </button>
      </header>
      
      {/* Main content area - only rendered when panel is open */}
      {open && (
        <div className="side-panel-content">
          {/* Navigation menu section */}
          <nav className="navigation">
            {/* Main navigation section */}
            <div className="nav-section">
              <div className="section-header">Main</div>
              <ul className="nav-list">
                {/* Home navigation item - currently active */}
                <li
                  className={cn("nav-item", {
                    active: currentView === "dashboard",
                  })}
                  onClick={onHomeClick}
                >
                  <FaHome className="nav-icon" />
                  <span className="nav-text">Home</span>
                </li>
              </ul>
            </div>

            {/* Settings navigation section */}
            <div className="nav-section">
              <div className="section-header">Settings</div>
              <ul className="nav-list">
                {/* Account settings item - opens settings dialog */}
                <li
                  className={cn("nav-item", {
                    active: currentView === "settings",
                  })}
                  onClick={onSettingsClick}
                >
                  <FaCog className="nav-icon" />
                  <span className="nav-text">Account</span>
                </li>
              </ul>
            </div>
          </nav>

          {/* User profile and sign out section */}
          <div className="user-section">
            {/* User profile display */}
            <div className="user-profile">
              {/* User avatar - shows profile picture or default icon */}
              <div className="user-avatar">
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="Profile" width={40} height={40} />
                ) : (
                  <FaUser />
                )}
              </div>
              
              {/* User information display */}
              <div className="user-info">
                <div className="user-name">{user?.displayName || "User"}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
            
            {/* Sign out button */}
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