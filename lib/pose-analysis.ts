import { ExerciseId } from "@/types/viscoach";

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface FrameAnalysis {
  formScore: number;
  phase: "setup" | "up" | "down";
  primaryCue: string;
  secondaryCue: string;
  cueKey: string;
  repComplete: boolean;
  metrics: {
    depthAngle?: number;
    torsoLean?: number;
    elbowAngle?: number;
    lineAngle?: number;
    leadKneeAngle?: number;
    kneeTravel?: number;
  };
}

const LANDMARKS = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftFoot: 31,
  rightFoot: 32
} as const;

export const SKELETON_CONNECTIONS: Array<[number, number]> = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 31],
  [28, 32]
];

function pointAt(landmarks: NormalizedLandmark[], index: number) {
  return landmarks[index];
}

function isVisible(point?: NormalizedLandmark) {
  return Boolean(point && (point.visibility ?? 1) > 0.35);
}

function average(...values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function angle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs((radians * 180) / Math.PI);
  if (degrees > 180) {
    degrees = 360 - degrees;
  }
  return degrees;
}

function angleToVertical(from: NormalizedLandmark, to: NormalizedLandmark) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.abs((Math.atan2(dx, dy) * 180) / Math.PI);
}

function hasFullBodyForExercise(landmarks: NormalizedLandmark[]) {
  const required = [
    LANDMARKS.leftShoulder,
    LANDMARKS.rightShoulder,
    LANDMARKS.leftHip,
    LANDMARKS.rightHip,
    LANDMARKS.leftKnee,
    LANDMARKS.rightKnee,
    LANDMARKS.leftAnkle,
    LANDMARKS.rightAnkle
  ];

  return required.every((index) => isVisible(pointAt(landmarks, index)));
}

export function analyzeExerciseFrame(
  exerciseId: ExerciseId,
  landmarks: NormalizedLandmark[],
  previousPhase: FrameAnalysis["phase"]
): FrameAnalysis {
  if (!hasFullBodyForExercise(landmarks)) {
    return {
      formScore: 40,
      phase: "setup",
      primaryCue: "Step back until your full body is visible.",
      secondaryCue: "Keep your head, hips, knees, and ankles inside the frame.",
      cueKey: "find-your-frame",
      repComplete: false,
      metrics: {}
    };
  }

  if (exerciseId === "squat") {
    return analyzeSquat(landmarks, previousPhase);
  }

  if (exerciseId === "pushup") {
    return analyzePushup(landmarks, previousPhase);
  }

  return analyzeLunge(landmarks, previousPhase);
}

function analyzeSquat(
  landmarks: NormalizedLandmark[],
  previousPhase: FrameAnalysis["phase"]
): FrameAnalysis {
  const leftKneeAngle = angle(
    pointAt(landmarks, LANDMARKS.leftHip),
    pointAt(landmarks, LANDMARKS.leftKnee),
    pointAt(landmarks, LANDMARKS.leftAnkle)
  );
  const rightKneeAngle = angle(
    pointAt(landmarks, LANDMARKS.rightHip),
    pointAt(landmarks, LANDMARKS.rightKnee),
    pointAt(landmarks, LANDMARKS.rightAnkle)
  );
  const depthAngle = average(leftKneeAngle, rightKneeAngle);
  const torsoLean = average(
    angleToVertical(
      pointAt(landmarks, LANDMARKS.leftHip),
      pointAt(landmarks, LANDMARKS.leftShoulder)
    ),
    angleToVertical(
      pointAt(landmarks, LANDMARKS.rightHip),
      pointAt(landmarks, LANDMARKS.rightShoulder)
    )
  );

  let phase: FrameAnalysis["phase"] = previousPhase;
  if (depthAngle < 112) {
    phase = "down";
  } else if (depthAngle > 164) {
    phase = "up";
  }

  const repComplete = previousPhase === "down" && phase === "up";

  let primaryCue = "Hold the line and keep moving.";
  let secondaryCue = `Depth angle ${Math.round(depthAngle)}°.`;
  let cueKey = "steady-squat";
  let score = 96;

  if (torsoLean > 28) {
    primaryCue = "Keep chest up.";
    secondaryCue = "Drive your sternum tall before you stand.";
    cueKey = "keep-chest-up";
    score -= 22;
  } else if (phase === "down" && depthAngle > 118) {
    primaryCue = "Lower your hips.";
    secondaryCue = "Aim to let the knees close below 110°.";
    cueKey = "lower-your-hips";
    score -= 18;
  } else if (phase === "up") {
    primaryCue = "Sit back and own the next rep.";
    secondaryCue = "Brace first, then descend under control.";
    cueKey = "set-up-next-rep";
    score -= 2;
  }

  return {
    formScore: clamp(Math.round(score), 48, 99),
    phase,
    primaryCue,
    secondaryCue,
    cueKey,
    repComplete,
    metrics: {
      depthAngle,
      torsoLean
    }
  };
}

function analyzePushup(
  landmarks: NormalizedLandmark[],
  previousPhase: FrameAnalysis["phase"]
): FrameAnalysis {
  const leftElbowAngle = angle(
    pointAt(landmarks, LANDMARKS.leftShoulder),
    pointAt(landmarks, LANDMARKS.leftElbow),
    pointAt(landmarks, LANDMARKS.leftWrist)
  );
  const rightElbowAngle = angle(
    pointAt(landmarks, LANDMARKS.rightShoulder),
    pointAt(landmarks, LANDMARKS.rightElbow),
    pointAt(landmarks, LANDMARKS.rightWrist)
  );
  const elbowAngle = average(leftElbowAngle, rightElbowAngle);
  const lineAngle = average(
    angle(
      pointAt(landmarks, LANDMARKS.leftShoulder),
      pointAt(landmarks, LANDMARKS.leftHip),
      pointAt(landmarks, LANDMARKS.leftAnkle)
    ),
    angle(
      pointAt(landmarks, LANDMARKS.rightShoulder),
      pointAt(landmarks, LANDMARKS.rightHip),
      pointAt(landmarks, LANDMARKS.rightAnkle)
    )
  );

  let phase: FrameAnalysis["phase"] = previousPhase;
  if (elbowAngle < 96) {
    phase = "down";
  } else if (elbowAngle > 152) {
    phase = "up";
  }

  const repComplete = previousPhase === "down" && phase === "up";

  let primaryCue = "Back is straight.";
  let secondaryCue = `Body line ${Math.round(lineAngle)}°.`;
  let cueKey = "back-is-straight";
  let score = 94;

  if (lineAngle < 160) {
    primaryCue = "Hips sagging.";
    secondaryCue = "Squeeze glutes and ribs together.";
    cueKey = "hips-sagging";
    score -= 26;
  } else if (phase === "up") {
    primaryCue = "Lower under control for your next rep.";
    secondaryCue = "Press the floor away and keep the body rigid.";
    cueKey = "next-pushup";
    score -= 4;
  }

  return {
    formScore: clamp(Math.round(score), 44, 99),
    phase,
    primaryCue,
    secondaryCue,
    cueKey,
    repComplete,
    metrics: {
      elbowAngle,
      lineAngle
    }
  };
}

function analyzeLunge(
  landmarks: NormalizedLandmark[],
  previousPhase: FrameAnalysis["phase"]
): FrameAnalysis {
  const leftKneeAngle = angle(
    pointAt(landmarks, LANDMARKS.leftHip),
    pointAt(landmarks, LANDMARKS.leftKnee),
    pointAt(landmarks, LANDMARKS.leftAnkle)
  );
  const rightKneeAngle = angle(
    pointAt(landmarks, LANDMARKS.rightHip),
    pointAt(landmarks, LANDMARKS.rightKnee),
    pointAt(landmarks, LANDMARKS.rightAnkle)
  );
  const frontSide = leftKneeAngle < rightKneeAngle ? "left" : "right";
  const leadKneeAngle = frontSide === "left" ? leftKneeAngle : rightKneeAngle;
  const frontKnee =
    frontSide === "left"
      ? pointAt(landmarks, LANDMARKS.leftKnee)
      : pointAt(landmarks, LANDMARKS.rightKnee);
  const frontFoot =
    frontSide === "left"
      ? pointAt(landmarks, LANDMARKS.leftFoot)
      : pointAt(landmarks, LANDMARKS.rightFoot);

  const kneeTravel = Math.abs(frontKnee.x - frontFoot.x);

  let phase: FrameAnalysis["phase"] = previousPhase;
  if (leadKneeAngle < 105) {
    phase = "down";
  } else if (leadKneeAngle > 158) {
    phase = "up";
  }

  const repComplete = previousPhase === "down" && phase === "up";

  let primaryCue = "Stack your ribs over your hips.";
  let secondaryCue = `Lead knee ${Math.round(leadKneeAngle)}°.`;
  let cueKey = "steady-lunge";
  let score = 93;

  if (kneeTravel > 0.14) {
    primaryCue = "Front knee too far forward.";
    secondaryCue = "Plant the heel and let the shin stay more vertical.";
    cueKey = "front-knee-too-far-forward";
    score -= 22;
  } else if (phase === "down" && leadKneeAngle > 112) {
    primaryCue = "Sink lower into the lunge.";
    secondaryCue = "Use the back knee to reach closer to the floor.";
    cueKey = "sink-lower-into-the-lunge";
    score -= 15;
  }

  return {
    formScore: clamp(Math.round(score), 50, 99),
    phase,
    primaryCue,
    secondaryCue,
    cueKey,
    repComplete,
    metrics: {
      leadKneeAngle,
      kneeTravel
    }
  };
}
