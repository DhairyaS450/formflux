/* eslint-disable react/display-name */
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Utility for conditional CSS classes
import cn from "classnames";

// React hooks and types
import {
  memo,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
// Context for AI streaming functionality
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
// Custom hooks for media handling
import { UseMediaStreamResult } from "@/hooks/use-media-stream-mux";
import { useWebcam } from "@/hooks/use-webcam";
// Audio recording functionality
import { AudioRecorder } from "@/lib/audio-recorder";
// UI Components
import AudioPulse from "@/components/audio-pulse/AudioPulse";
import "./control-tray.scss";

// Props interface for the ControlTray component
export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement | null>; // Reference to video element
  children?: ReactNode; // Optional child components
  supportsVideo: boolean; // Whether video features are supported
  onVideoStreamChange?: (stream: MediaStream | null) => void; // Callback for video stream changes
  onStopWorkout: () => void; // Callback to stop workout session
};

// Props interface for media stream buttons (webcam/screen capture)
type MediaStreamButtonProps = {
  isStreaming: boolean; // Whether media is currently streaming
  onIcon: string; // Icon to show when streaming is active
  offIcon: string; // Icon to show when streaming is inactive
  start: () => Promise<MediaStream>; // Function to start streaming
  stop: () => void; // Function to stop streaming
};

/**
 * Reusable button component for triggering webcam or screen-capture
 * Shows different icons and handles start/stop functionality
 */
const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop }: MediaStreamButtonProps) =>
    isStreaming ? (
      // Button to stop streaming
      <button className="action-button" onClick={stop}>
        <span className="material-symbols-outlined">{onIcon}</span>
      </button>
    ) : (
      // Button to start streaming
      <button className="action-button" onClick={start}>
        <span className="material-symbols-outlined">{offIcon}</span>
      </button>
    )
);

function ControlTray({
  videoRef,
  children,
  onVideoStreamChange = () => {},
  supportsVideo,
  onStopWorkout,
}: ControlTrayProps) {
  // State to track the currently active video stream
  const [activeVideoStream, setActiveVideoStream] =
    useState<MediaStream | null>(null);
  
  // Webcam hook for camera functionality
  const webcam = useWebcam();
  
  // Audio input volume level (0-1)
  const [inVolume, setInVolume] = useState(0);
  
  // Audio recorder instance for capturing microphone input
  const [audioRecorder] = useState(() => new AudioRecorder());
  
  // Whether microphone is muted
  const [muted, setMuted] = useState(false);
  
  // Hidden canvas for video frame processing
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Reference to the connect/disconnect button
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  // Get Live API context for AI streaming
  const { client, connected, connect, disconnect, volume } =
    useLiveAPIContext();

  /**
   * Function to change video streams (webcam/screen capture)
   * Stops current webcam if active, then starts the new stream
   */
  const changeStreams = useCallback(
    (streamer: UseMediaStreamResult) => async () => {
      if (webcam.isStreaming) {
        webcam.stop();
      }
      const stream = await streamer.start();
      setActiveVideoStream(stream);
      onVideoStreamChange(stream);

      return stream;
    },
    [webcam, onVideoStreamChange]
  );

  // Auto-start webcam when component mounts
  useEffect(() => {
    if (webcam && !webcam.isStreaming) {
      changeStreams(webcam)();
    }
  }, [webcam, changeStreams]);

  // Update CSS custom property for volume visualization
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  // Handle audio recording and streaming to AI
  useEffect(() => {
    const onData = (base64: string) => {
      // Send audio data to AI client
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    
    // Start recording if connected and not muted
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    
    // Cleanup event listeners
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  // Handle video streaming to AI
  useEffect(() => {
    // Set video element source
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    /**
     * Function to capture and send video frames to AI
     * Processes video at 0.5 FPS to reduce bandwidth
     */
    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      // Get canvas context and set dimensions (25% of video size for performance)
      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      
      // Draw video frame to canvas and convert to base64
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        
        // Send video frame to AI client
        client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      
      // Schedule next frame capture
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    
    // Start video frame capture if connected and video stream exists
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef]);

  return (
    <section className="control-tray">
      {/* Hidden canvas for video frame processing */}
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      
      {/* Action buttons navigation */}
      <nav className={cn("actions-nav", { disabled: !connected })}>
        {/* Microphone toggle button */}
        <button
          className={cn("action-button mic-button")}
          onClick={() => setMuted(!muted)}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        {/* Video camera button - only shown if video is supported */}
        {supportsVideo && (
          <>
            <MediaStreamButton
              isStreaming={webcam.isStreaming}
              onIcon="videocam_off"
              offIcon="videocam"
              start={changeStreams(webcam)}
              stop={webcam.stop}
            />
          </>
        )}
        
        {/* Additional child components */}
        {children}
      </nav>

      {/* Connection status and control */}
      <div className={cn("connection-container", { connected })}>
        <div className="connection-button-container">
          {/* Connect/disconnect button */}
          <button
            ref={connectButtonRef}
            className={cn("action-button connect-toggle", { connected })}
            onClick={connected ? disconnect : connect}
          >
            <span className="material-symbols-outlined filled">
              {connected ? "pause" : "play_arrow"}
            </span>
          </button>
        </div>
        {/* Connection status text */}
        <span className="text-indicator">Streaming</span>
      </div>
      
      {/* Stop workout button */}
      <button className="action-button" onClick={onStopWorkout}>
        <span className="material-symbols-outlined">stop</span>
      </button>
    </section>
  );
}

export default memo(ControlTray);
