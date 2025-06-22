"use client";

// React hooks for state management and DOM references
import { useRef, useState } from "react";
// Context provider for AI streaming functionality
import { LiveAPIProvider } from "@/contexts/LiveAPIContext";
// UI Components
import SidePanel from "@/components/side-panel/SidePanel";
import { Altair } from "@/components/altair/Altair";
import ControlTray from "@/components/control-tray/ControlTray";
import cn from "classnames";
// Type definitions for API configuration
import { LiveClientOptions } from "@/types";
// Authentication context and components
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/landing-page/LandingPage";
import WorkoutDashboard from "@/components/workout-dashboard/WorkoutDashboard";
import SettingsPage from "@/components/settings-page/SettingsPage";

// Environment variable for Gemini API key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

// Configuration object for the Live API client
const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};
// Home page component
export default function Home() {
  console.log("Home page rendered");
  // Authentication state and functions
  const { user, googleSignIn } = useAuth();
  // Reference to video element for webcam/screen capture display
  const videoRef = useRef<HTMLVideoElement>(null);
  // Current video stream state
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // Whether a workout session is currently active
  const [workoutStarted, setWorkoutStarted] = useState(false);
  // Settings dialog visibility state
  const [currentView, setCurrentView] = useState<"dashboard" | "settings">(
    "dashboard"
  );
  const [repCount, setRepCount] = useState(0);

  // Handle Google authentication
  const handleSignIn = async () => {
    console.log("handleSignIn called");
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  // Start workout session - transition to workout interface
  const handleStartWorkout = () => {
    console.log("handleStartWorkout called");
    setWorkoutStarted(true);
    setRepCount(0);
  };

  // Stop workout session - return to dashboard
  const handleStopWorkout = () => {
    console.log("handleStopWorkout called");
    setWorkoutStarted(false);
    setVideoStream(null);
  };

  const handleRepCount = () => {
    console.log("handleRepCount called");
    setRepCount((reps) => reps + 1);
  };

  return (
    <div className="App">
      {/* Conditional rendering based on authentication status */}
      {user ? (
        // Main application for authenticated users
        <LiveAPIProvider options={apiOptions}>
          <div className="streaming-console">
            {/* Side navigation panel */}
            <SidePanel
              currentView={currentView}
              onHomeClick={() => setCurrentView("dashboard")}
              onSettingsClick={() => setCurrentView("settings")}
            />

            {/* Conditional rendering based on workout state */}
            {currentView === "dashboard" ? (
              workoutStarted ? (
                // Active workout interface
                <main
                  style={{
                    width: "100vw",
                    height: "100vh",
                    background: "#000",
                    overflow: "hidden",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <div
                    className="main-app-area"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {/* Video stream display */}
                    <video
                      className={cn("stream", {
                        hidden: !videoRef.current || !videoStream,
                      })}
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* Rep counter */}
                    <div
                      className="counter"
                      style={{
                        position: "absolute",
                        top: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 101,
                        fontSize: "3rem",
                        fontWeight: "bold",
                        color: "#fff",
                        textShadow: "0 2px 8px #000, 0 0 2px #000",
                        background: "rgba(0,0,0,0.35)",
                        borderRadius: "1.5rem",
                        padding: "0.5rem 2.5rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {repCount}
                    </div>
                    {/* Control panel for media and connection */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 102,
                      }}
                    >
                      <ControlTray
                        videoRef={videoRef}
                        supportsVideo={true}
                        onVideoStreamChange={setVideoStream}
                        onStopWorkout={handleStopWorkout}
                      />
                    </div>
                    {/* AI chat interface */}
                    <Altair onRepCount={handleRepCount} />
                  </div>
                </main>
              ) : (
                <main>
                  <WorkoutDashboard onStartWorkout={handleStartWorkout} />
                </main>
              )
            ) : (
              <SettingsPage />
            )}
          </div>
        </LiveAPIProvider>
      ) : (
        // Landing page for unauthenticated users
        <LandingPage handleSignIn={handleSignIn} />
      )}
    </div>
  );
}
