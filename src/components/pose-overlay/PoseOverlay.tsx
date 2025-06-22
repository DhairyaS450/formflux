import { useEffect, useRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { drawPose } from "@/lib/drawing-utils";
import "./pose-overlay.scss";

interface PoseOverlayProps {
  landmarks: NormalizedLandmark[] | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function PoseOverlay({ landmarks, videoRef }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && landmarks) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        drawPose(ctx, landmarks, video);
      }
    }
  }, [landmarks, videoRef]);

  return <canvas ref={canvasRef} className="pose-overlay" />;
}
