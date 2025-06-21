"use client";

import { useRef, useState } from "react";
import { LiveAPIProvider } from "@/contexts/LiveAPIContext";
import SidePanel from "@/components/side-panel/SidePanel";
import { Altair } from "@/components/altair/Altair";
import ControlTray from "@/components/control-tray/ControlTray";
import cn from "classnames";
import { LiveClientOptions } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "@/components/landing-page/LandingPage";
import WorkoutDashboard from "@/components/workout-dashboard/WorkoutDashboard";
import SettingsDialog from "@/components/settings-dialog/SettingsDialog";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

export default function Home() {
  const { user, googleSignIn } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
  };

  const handleStopWorkout = () => {
    setWorkoutStarted(false);
    setVideoStream(null);
  };

  return (
    <div className="App">
      {user ? (
        <LiveAPIProvider options={apiOptions}>
          <div className="streaming-console">
            <SidePanel onSettingsClick={() => setSettingsOpen(true)} />
            {workoutStarted ? (
              <main>
                <div className="main-app-area">
                  <Altair />
                  <video
                    className={cn("stream", {
                      hidden: !videoRef.current || !videoStream,
                    })}
                    ref={videoRef}
                    autoPlay
                    playsInline
                  />
                </div>

                <ControlTray
                  videoRef={videoRef}
                  supportsVideo={true}
                  onVideoStreamChange={setVideoStream}
                  onStopWorkout={handleStopWorkout}
                />
              </main>
            ) : (
              <main>
                <WorkoutDashboard onStartWorkout={handleStartWorkout} />
              </main>
            )}
          </div>
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </LiveAPIProvider>
      ) : (
        <LandingPage handleSignIn={handleSignIn} />
      )}
    </div>
  );
}
