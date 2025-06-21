import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { FaDiscord, FaHome, FaCalendarAlt, FaUsers, FaShareAlt, FaTicketAlt, FaCog, FaMapMarkerAlt } from "react-icons/fa";
import "./side-panel.scss";
import { useState } from "react";

export default function SidePanel() {
  const [open, setOpen] = useState(true);


  return (
    <div className={`side-panel ${open ? "open" : ""}`}>
      <header className="top">
        <h2>FormFlux</h2>
        {/* Open if open is true(If clicked )*/}
        {open ? (
          <button className="opener" onClick={() => setOpen(false)}>
            <RiSidebarFoldLine color="#b4b8bb" />
          </button>
          /* ELSE*/
        ) : (
          <button className="opener" onClick={() => setOpen(true)}>
            <RiSidebarUnfoldLine color="#b4b8bb" />
          </button>
        )}
      </header>
      {open && (
        <>
          <nav className="menu">
            <ul>
              <li>
                <FaDiscord /> <span>Discord Support</span>
              </li>
            </ul>
            <div className="section-label">MAIN</div>
            <ul>
              <li className="active">
                <FaHome /> <span>Home</span>
              </li>
              <li>
                <FaCalendarAlt /> <span>Schedule</span>
              </li>
            </ul>
            <div className="section-label">SETTINGS</div>
            <ul>
              <li>
                <FaCog /> <span>Account</span>
              </li>
            </ul>
          </nav>
          <div className="profile-bar">
            <div className="profile-info">
              <div className="profile-pic" />
            </div>
            <button className="profile-expand">{/* Add expand icon if needed */}</button>
          </div>
        </>
      )}
    </div>
  );
}