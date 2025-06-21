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
import SettingsDialog from "@/components/settings-dialog/SettingsDialog";

// Environment variable for Gemini API key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

// Configuration object for the Live API client
const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

export default function Home() {
  // Authentication state and functions
  const { user, googleSignIn } = useAuth();
  // Reference to video element for webcam/screen capture display
  const videoRef = useRef<HTMLVideoElement>(null);
  // Current video stream state
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // Whether a workout session is currently active
  const [workoutStarted, setWorkoutStarted] = useState(false);
  // Settings dialog visibility state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [repCount, setRepCount] = useState(0);

  // Handle Google authentication
  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  // Start workout session - transition to workout interface
  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setRepCount(0);
  };

  // Stop workout session - return to dashboard
  const handleStopWorkout = () => {
    setWorkoutStarted(false);
    setVideoStream(null);
  };

  const handleRepCount = () => {
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
            <SidePanel onSettingsClick={() => setSettingsOpen(true)} />
            
            {/* Conditional rendering based on workout state */}
            {workoutStarted ? (
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
            )}
          </div>
          
          {/* Settings dialog */}
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </LiveAPIProvider>
      ) : (
        // Landing page for unauthenticated users
        <LandingPage handleSignIn={handleSignIn} />
      )}
    </div>
  );
}
