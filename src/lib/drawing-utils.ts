import { NormalizedLandmark } from "@mediapipe/tasks-vision";

const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  // Left Arm
  [11, 13],
  [13, 15],
  // Right Arm
  [12, 14],
  [14, 16],
  // Left Leg
  [23, 25],
  [25, 27],
  // Right Leg
  [24, 26],
  [26, 28],
];

export function drawPose(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], video: HTMLVideoElement) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);

  if (!landmarks) return;

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#fff";

  // Draw connectors
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start && end) {
      ctx.beginPath();
      ctx.moveTo(start.x * videoWidth, start.y * videoHeight);
      ctx.lineTo(end.x * videoWidth, end.y * videoHeight);
      ctx.stroke();
    }
  });

  // Draw landmarks
  landmarks.forEach((landmark) => {
    if (landmark) {
      ctx.beginPath();
      ctx.arc(landmark.x * videoWidth, landmark.y * videoHeight, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff0000";
      ctx.fill();
    }
  });
}
