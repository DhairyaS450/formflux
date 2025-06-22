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

import {
  PoseLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | undefined = undefined;

// Function to calculate the angle between three landmarks
function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

// Initializes the PoseLandmarker
export async function createPoseLandmarker(): Promise<PoseLandmarker> {
  console.log("createPoseLandmarker called");
  if (poseLandmarker) {
    console.log("Returning existing PoseLandmarker instance");
    return poseLandmarker;
  }
  console.log("Creating new PoseLandmarker instance");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `/pose_landmarker_lite.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
  console.log("PoseLandmarker created successfully");
  return poseLandmarker;
}

// Processes landmarks to calculate key body angles
export function getPoseAngles(landmarks: NormalizedLandmark[]) {
  const l = {
    shoulder: landmarks[11],
    elbow: landmarks[13],
    wrist: landmarks[15],
    hip: landmarks[23],
    knee: landmarks[25],
    ankle: landmarks[27],
  };
  const r = {
    shoulder: landmarks[12],
    elbow: landmarks[14],
    wrist: landmarks[16],
    hip: landmarks[24],
    knee: landmarks[26],
    ankle: landmarks[28],
  };

  return {
    leftElbow: calculateAngle(l.shoulder, l.elbow, l.wrist),
    rightElbow: calculateAngle(r.shoulder, r.elbow, r.wrist),
    leftShoulder: calculateAngle(l.elbow, l.shoulder, l.hip),
    rightShoulder: calculateAngle(r.elbow, r.shoulder, r.hip),
    leftHip: calculateAngle(l.shoulder, l.hip, l.knee),
    rightHip: calculateAngle(r.shoulder, r.hip, r.knee),
    leftKnee: calculateAngle(l.hip, l.knee, l.ankle),
    rightKnee: calculateAngle(r.hip, r.knee, r.ankle),
  };
}
