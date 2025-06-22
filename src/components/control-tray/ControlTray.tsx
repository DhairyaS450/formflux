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
import {
  createLlmInference,
  createPoseLandmarker,
  getPoseAngles,
  getPoseDescription,
} from "@/lib/pose-processor";
import { NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { LlmInference } from "@mediapipe/tasks-genai";

// Props interface for the ControlTray component
export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement | null>; // Reference to video element
  children?: ReactNode; // Optional child components
  supportsVideo: boolean; // Whether video features are supported
  onVideoStreamChange?: (stream: MediaStream | null) => void; // Callback for video stream changes
  onStopWorkout: () => void; // Callback to stop workout session
  onLandmarks: (landmarks: NormalizedLandmark[] | null) => void;
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
  onLandmarks,
}: ControlTrayProps) {
  console.log("ControlTray rendered");
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
  const { client, connected, connect, disconnect } = useLiveAPIContext();

  /**
   * Function to change video streams (webcam/screen capture)
   * Stops current webcam if active, then starts the new stream
   */
  const changeStreams = useCallback(
    (streamer: UseMediaStreamResult) => async () => {
      console.log("ControlTray: changeStreams called for", streamer.type);
      if (webcam.isStreaming) {
        console.log("ControlTray: Stopping existing webcam stream");
        webcam.stop();
      }
      console.log("ControlTray: Starting new stream");
      const stream = await streamer.start();
      setActiveVideoStream(stream);
      onVideoStreamChange(stream);

      return stream;
    },
    [webcam, onVideoStreamChange]
  );

  // Auto-start webcam when component mounts
  useEffect(() => {
    console.log("ControlTray: Auto-start webcam effect running");
    if (webcam && !webcam.isStreaming) {
      console.log("ControlTray: Webcam not streaming, calling changeStreams");
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
    console.log("ControlTray: Audio recording effect running. Connected:", connected, "Muted:", muted);
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
      console.log("ControlTray: Starting audio recorder");
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      console.log("ControlTray: Stopping audio recorder");
      audioRecorder.stop();
    }
    
    // Cleanup event listeners
    return () => {
      console.log("ControlTray: Cleaning up audio recorder listeners");
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  // --- MODIFIED: MediaPipe and Video Processing Logic ---
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const llmInferenceRef = useRef<LlmInference | null>(null);
  const lastPoseSendTimeRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Initialize MediaPipe PoseLandmarker and LlmInference
  useEffect(() => {
    console.log(
      "ControlTray: Initializing MediaPipe PoseLandmarker and LlmInference"
    );
    async function initializeMediaPipe() {
      poseLandmarkerRef.current = await createPoseLandmarker();
      llmInferenceRef.current = await createLlmInference();
      console.log(
        "ControlTray: MediaPipe PoseLandmarker and LlmInference initialized"
      );
    }
    initializeMediaPipe();
  }, []);

  // Handle video streaming to AI
  useEffect(() => {
    console.log(
      "ControlTray: Video processing effect running. Connected:",
      connected,
      "ActiveVideoStream:",
      !!activeVideoStream
    );
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    const processVideo = async () => {
      const video = videoRef.current;
      const landmarker = poseLandmarkerRef.current;
      const llm = llmInferenceRef.current;

      if (connected && landmarker && llm && video && video.readyState >= 2) {
        const now = performance.now();
        const poseResults = landmarker.detectForVideo(video, now);
        onLandmarks(poseResults.landmarks[0] || null);
        const nowMs = Date.now();

        // Throttle pose data sending to 1 FPS (every 1000ms)
        if (nowMs - lastPoseSendTimeRef.current > 1000) {
          // Send pose landmark data
          if (poseResults.landmarks && poseResults.landmarks.length > 0) {
            const angles = getPoseAngles(poseResults.landmarks[0]);
            const description = await getPoseDescription(llm, angles);
            client.send([{ text: description }], false);
            lastPoseSendTimeRef.current = nowMs;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(processVideo);
    };

    if (connected && activeVideoStream) {
      console.log("ControlTray: Starting video processing loop");
      // Reset timer on connect
      lastPoseSendTimeRef.current = 0;
      animationFrameId.current = requestAnimationFrame(processVideo);
    } else {
      if (animationFrameId.current) {
        console.log("ControlTray: Stopping video processing loop");
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        console.log("ControlTray: Cleaning up video processing loop");
        cancelAnimationFrame(animationFrameId.current);
        onLandmarks(null);
      }
    };
  }, [
    connected,
    activeVideoStream,
    client,
    videoRef,
    onLandmarks,
    llmInferenceRef,
  ]);

  return (
    <section className="control-tray">
      <canvas ref={renderCanvasRef} className="render-canvas" />
      
      {/* Action buttons are now direct children of the flex container */}
      <button
        className={cn("action-button mic-button", { disabled: !connected })}
        onClick={() => setMuted(!muted)}
        disabled={!connected}
      >
        <span className="material-symbols-outlined">{!muted ? "mic" : "mic_off"}</span>
      </button>

      {supportsVideo && (
        <MediaStreamButton
          isStreaming={webcam.isStreaming}
          onIcon="videocam_off"
          offIcon="videocam"
          start={changeStreams(webcam)}
          stop={webcam.stop}
        />
      )}
      
      {children}
      
      {/* Connect/disconnect button */}
      <button
        ref={connectButtonRef}
        className={cn("action-button connect-toggle", { connected })}
        onClick={connected ? disconnect : connect}
      >
        <span className="material-symbols-outlined">{connected ? "pause" : "play_arrow"}</span>
      </button>

      <button className="action-button stop-button" onClick={onStopWorkout}>
        <span className="material-symbols-outlined">stop</span>
      </button>
    </section>
  );
}

export default memo(ControlTray);
