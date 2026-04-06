"use client";

import { useAppState } from "@/components/app-state-provider";
import {
  analyzeExerciseFrame,
  FrameAnalysis,
  NormalizedLandmark,
  SKELETON_CONNECTIONS
} from "@/lib/pose-analysis";
import { ExerciseDefinition } from "@/types/viscoach";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type VisionModule = typeof import("@mediapipe/tasks-vision");
type PoseLandmarkerType = import("@mediapipe/tasks-vision").PoseLandmarker;
type PoseLandmarkerResultType =
  import("@mediapipe/tasks-vision").PoseLandmarkerResult;

const MEDIAPIPE_VERSION = "0.10.22-rc.20250304";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

function closePoseDetector(detector: PoseLandmarkerType | null) {
  if (!detector) {
    return;
  }

  try {
    detector.close();
  } catch {}
}

export function WorkoutStudio({ exercise }: { exercise: ExerciseDefinition }) {
  const router = useRouter();
  const { saveSession } = useAppState();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<PoseLandmarkerType | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const cameraStatusRef = useRef<"idle" | "starting" | "live" | "stopped">("idle");
  const phaseRef = useRef<FrameAnalysis["phase"]>("setup");
  const lastHudUpdateRef = useRef(0);
  const scoreHistoryRef = useRef<number[]>([]);
  const cueCountsRef = useRef<Record<string, number>>({});
  const repCountRef = useRef(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const hasSavedSessionRef = useRef(false);

  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "starting" | "live" | "stopped"
  >("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Loading pose model for live camera coaching."
  );
  const [primaryCue, setPrimaryCue] = useState("Step into frame when you are ready.");
  const [secondaryCue, setSecondaryCue] = useState(
    "The overlay will appear once the camera and pose model are both live."
  );
  const [phase, setPhase] = useState<FrameAnalysis["phase"]>("setup");
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let pendingDetector: PoseLandmarkerType | null = null;

    async function loadPoseModel() {
      try {
        const vision: VisionModule = await import("@mediapipe/tasks-vision");
        const resolver = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
        const detector = await vision.PoseLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: MODEL_URL
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55
        });
        pendingDetector = detector;

        if (cancelled) {
          closePoseDetector(pendingDetector);
          pendingDetector = null;
          return;
        }

        detectorRef.current = detector;
        pendingDetector = null;
        setModelStatus("ready");
        setStatusMessage("Pose model ready. Enable your camera to start.");
      } catch (error) {
        closePoseDetector(pendingDetector);
        pendingDetector = null;

        if (cancelled) {
          return;
        }

        console.error(error);
        setModelStatus("error");
        setStatusMessage(
          "Pose model failed to load. Confirm internet access for MediaPipe assets and retry."
        );
      }
    }

    void loadPoseModel();

    return () => {
      cancelled = true;
      stopCamera(false);
      closePoseDetector(detectorRef.current);
      detectorRef.current = null;
      closePoseDetector(pendingDetector);
      pendingDetector = null;
    };
  }, []);

  useEffect(() => {
    if (cameraStatus !== "live") {
      return;
    }

    const timer = window.setInterval(() => {
      if (!sessionStartedAtRef.current) {
        return;
      }

      setDurationSeconds(
        Math.max(0, Math.round((Date.now() - sessionStartedAtRef.current) / 1000))
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cameraStatus]);

  async function startCamera() {
    if (!videoRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusMessage("This browser does not support camera access.");
      return;
    }

    setCameraStatus("starting");
    cameraStatusRef.current = "starting";
    setStatusMessage("Requesting camera access.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      resetSessionState();
      sessionStartedAtRef.current = Date.now();
      setCameraStatus("live");
      cameraStatusRef.current = "live";
      setStatusMessage("Camera live. Hold the pose until landmarks lock.");
      runInferenceLoop();
    } catch (error) {
      console.error(error);
      setCameraStatus("idle");
      cameraStatusRef.current = "idle";
      setStatusMessage("Camera access was blocked. Allow webcam access and try again.");
    }
  }

  function resetSessionState() {
    phaseRef.current = "setup";
    lastHudUpdateRef.current = 0;
    scoreHistoryRef.current = [];
    cueCountsRef.current = {};
    repCountRef.current = 0;
    lastVideoTimeRef.current = -1;
    hasSavedSessionRef.current = false;
    setRepCount(0);
    setFormScore(0);
    setDurationSeconds(0);
    setPhase("setup");
    setPrimaryCue("Step into frame when you are ready.");
    setSecondaryCue("Keep your full body visible for the best tracking.");
  }

  function stopTracks() {
    if (!streamRef.current) {
      return;
    }

    for (const track of streamRef.current.getTracks()) {
      track.stop();
    }

    streamRef.current = null;
  }

  function stopCamera(saveWorkout: boolean) {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    stopTracks();
    setCameraStatus("stopped");
    cameraStatusRef.current = "stopped";

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    clearCanvas();

    if (saveWorkout) {
      persistSession();
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function runInferenceLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || !detector) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const frame = () => {
      if (
        cameraStatusRef.current !== "live" ||
        !detectorRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2
      ) {
        animationRef.current = window.requestAnimationFrame(frame);
        return;
      }

      const activeVideo = videoRef.current;
      if (
        activeVideo.currentTime !== lastVideoTimeRef.current &&
        activeVideo.videoWidth > 0 &&
        activeVideo.videoHeight > 0
      ) {
        lastVideoTimeRef.current = activeVideo.currentTime;
        if (
          canvas.width !== activeVideo.videoWidth ||
          canvas.height !== activeVideo.videoHeight
        ) {
          canvas.width = activeVideo.videoWidth;
          canvas.height = activeVideo.videoHeight;
        }

        const result = detectorRef.current.detectForVideo(
          activeVideo,
          performance.now()
        ) as PoseLandmarkerResultType;

        const landmarks = result.landmarks[0] as
          | NormalizedLandmark[]
          | undefined;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(10, 17, 13, 0.12)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (landmarks) {
          drawPoseOverlay(context, landmarks, canvas.width, canvas.height);
          const analysis = analyzeExerciseFrame(
            exercise.id,
            landmarks,
            phaseRef.current
          );
          phaseRef.current = analysis.phase;

          if (analysis.repComplete) {
            repCountRef.current += 1;
            setRepCount(repCountRef.current);
          }

          scoreHistoryRef.current.push(analysis.formScore);
          cueCountsRef.current[analysis.cueKey] =
            (cueCountsRef.current[analysis.cueKey] ?? 0) + 1;

          if (performance.now() - lastHudUpdateRef.current > 180) {
            lastHudUpdateRef.current = performance.now();
            setPrimaryCue(analysis.primaryCue);
            setSecondaryCue(analysis.secondaryCue);
            setPhase(analysis.phase);
            setFormScore(analysis.formScore);
            setStatusMessage("Tracking live. Keep the full movement in frame.");
          }
        } else {
          setPrimaryCue("Find your frame.");
          setSecondaryCue("Step back until ankles and hands remain visible.");
          setPhase("setup");
          setStatusMessage("Pose not detected yet. Re-center and hold still briefly.");
        }
      }

      animationRef.current = window.requestAnimationFrame(frame);
    };

    animationRef.current = window.requestAnimationFrame(frame);
  }

  function drawPoseOverlay(
    context: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    width: number,
    height: number
  ) {
    context.lineWidth = 5;
    context.strokeStyle = "rgba(201, 255, 67, 0.9)";
    context.lineCap = "round";

    for (const [start, end] of SKELETON_CONNECTIONS) {
      const first = landmarks[start];
      const second = landmarks[end];
      if (!first || !second) {
        continue;
      }

      context.beginPath();
      context.moveTo(first.x * width, first.y * height);
      context.lineTo(second.x * width, second.y * height);
      context.stroke();
    }

    for (const landmark of landmarks) {
      context.beginPath();
      context.fillStyle = "rgba(255, 122, 26, 0.95)";
      context.arc(landmark.x * width, landmark.y * height, 5, 0, Math.PI * 2);
      context.fill();
    }
  }

  function persistSession() {
    if (hasSavedSessionRef.current || !sessionStartedAtRef.current) {
      return;
    }

    hasSavedSessionRef.current = true;
    const averageScore = scoreHistoryRef.current.length
      ? Math.round(
          scoreHistoryRef.current.reduce((sum, score) => sum + score, 0) /
            scoreHistoryRef.current.length
        )
      : 0;

    const topCue =
      Object.entries(cueCountsRef.current).sort((left, right) => right[1] - left[1])[0]?.[0] ??
      "steady-form";

    saveSession({
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      completedAt: new Date().toISOString(),
      reps: repCountRef.current,
      avgFormScore: averageScore,
      mostCommonCorrection: topCue,
      durationSeconds:
        sessionStartedAtRef.current === null
          ? 0
          : Math.round((Date.now() - sessionStartedAtRef.current) / 1000),
      cueCounts: cueCountsRef.current
    });
  }

  const canStart = modelStatus === "ready" && cameraStatus !== "starting" && cameraStatus !== "live";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="panel overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">{exercise.name}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">
              Live workout camera
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-mist/75">
              Use the browser camera on your Mac, keep your full body visible, and
              let the MVP run short, rule-based coaching prompts over the pose
              overlay.
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-mist/70">
            {statusMessage}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/40">
          <div className="relative aspect-[16/10] w-full bg-[radial-gradient(circle_at_top,_rgba(201,255,67,0.12),_transparent_45%),linear-gradient(180deg,_rgba(10,17,13,0.95),_rgba(5,8,7,1))]">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover [transform:scaleX(-1)]"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full [transform:scaleX(-1)]"
            />

            {cameraStatus !== "live" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div className="panel mx-4 max-w-md p-6 text-center">
                  <p className="eyebrow">Camera prep</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    Enable the webcam to start the session.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-mist/70">
                    For the cleanest squat and lunge cues, stand far enough back to
                    keep ankles in frame and rotate slightly side-on.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={startCamera}
              disabled={!canStart}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cameraStatus === "live"
                ? "Camera live"
                : cameraStatus === "starting"
                  ? "Starting camera"
                  : "Enable camera"}
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera(true);
                router.push("/coach/progress");
              }}
              className="button-secondary"
            >
              End and save session
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="panel p-5">
          <p className="eyebrow">Coach cue</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white">
            {primaryCue}
          </h2>
          <p className="mt-3 text-sm leading-6 text-mist/70">{secondaryCue}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="panel-subtle p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">Reps</p>
            <p className="mt-3 metric-value">{repCount}</p>
          </div>
          <div className="panel-subtle p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
              Form score
            </p>
            <p className="mt-3 metric-value">
              {formScore ? `${formScore}%` : "--"}
            </p>
          </div>
          <div className="panel-subtle p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
              Session time
            </p>
            <p className="mt-3 metric-value">
              {durationSeconds ? `${durationSeconds}s` : "--"}
            </p>
          </div>
          <div className="panel-subtle p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-mist/55">
              Phase
            </p>
            <p className="mt-3 metric-value capitalize">{phase}</p>
          </div>
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Exercise focus</p>
          <div className="mt-4 space-y-3">
            {exercise.focus.map((focus) => (
              <div
                key={focus}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist/75"
              >
                {focus}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <p className="eyebrow">Tracking state</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-mist/75">
            <p>
              Pose model:{" "}
              <span className="font-semibold text-white">
                {modelStatus === "ready"
                  ? "Ready"
                  : modelStatus === "loading"
                    ? "Loading"
                    : "Unavailable"}
              </span>
            </p>
            <p>
              Camera:{" "}
              <span className="font-semibold text-white capitalize">
                {cameraStatus}
              </span>
            </p>
            <p>
              Asset dependency: MediaPipe Pose Landmarker uses a browser-fetched
              model and WASM bundle for this MVP.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
