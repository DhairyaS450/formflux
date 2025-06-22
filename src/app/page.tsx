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
                <main>
                  <div className="main-app-area">
                    <div className="counter">{repCount}</div>
                    {/* AI chat interface */}
                    <Altair onRepCount={handleRepCount} />
                    {/* Video stream display */}
                    <video
                      className={cn("stream", {
                        hidden: !videoRef.current || !videoStream,
                      })}
                      ref={videoRef}
                      autoPlay
                      playsInline
                    />
                  </div>

                  {/* Control panel for media and connection */}
                  <ControlTray
                    videoRef={videoRef}
                    supportsVideo={true}
                    onVideoStreamChange={setVideoStream}
                    onStopWorkout={handleStopWorkout}
                  />
                </main>
              ) : (
                // Dashboard interface
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
