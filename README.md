# VisCoach MVP

VisCoach is a browser-based workout coaching MVP built with Next.js, React, Tailwind, and MediaPipe Pose Landmarker. The current product flow focuses on the in-app demo experience only:

- onboarding
- dashboard
- exercise library
- live workout camera with pose overlay
- progress tracking

There is no backend in this version. User onboarding data and session summaries are stored locally in the browser with `localStorage`.

## What This Repo Includes

- A 6-step onboarding flow modeled after the wireframe
- A small exercise library with 3 supported exercises:
  - squat
  - push-up
  - lunge
- A live browser camera workout screen using `getUserMedia()`
- Pose tracking with `@mediapipe/tasks-vision`
- Lightweight rule-based coaching cues
- A progress page with locally saved metrics

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- MediaPipe Pose Landmarker for Web

## Requirements

- Node.js 18+  
  Tested locally on Node `18.20.8`
- npm 9+
- A modern browser with webcam access
- Internet access during runtime for MediaPipe assets

## Quick Start

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

The root route will redirect to:

- `/onboarding` if no local profile exists
- `/coach/library` if onboarding has already been completed on that browser

## Available Scripts

### Start the development server

```bash
npm run dev
```

### Type-check the app

```bash
npm run typecheck
```

### Build for production

```bash
npm run build
```

### Run the production build locally

```bash
npm run start
```

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  onboarding/page.tsx
  coach/
    layout.tsx
    page.tsx
    dashboard/page.tsx
    library/page.tsx
    progress/page.tsx
    workout/[exercise]/page.tsx

components/
  app-state-provider.tsx
  brand-mark.tsx
  coach-shell.tsx
  onboarding-flow.tsx
  workout-studio.tsx

lib/
  exercises.ts
  pose-analysis.ts
  storage.ts

types/
  viscoach.ts
```

## Core Routes

- `/onboarding`
  - six-step onboarding flow
  - stores the user profile in local storage
- `/coach/dashboard`
  - overview metrics and recommendation panel
- `/coach/library`
  - exercise selection page for the 3 supported exercises
- `/coach/workout/squat`
- `/coach/workout/pushup`
- `/coach/workout/lunge`
  - live workout pages using the browser camera
- `/coach/progress`
  - session summaries and local progress metrics

## How The MVP Works

### 1. Onboarding

The onboarding flow collects:

- motivation
- training goals
- privacy acceptance
- preferred movement type
- desired start timing

This data is saved locally through the shared app state provider.

### 2. Exercise Library

The library is intentionally small for demo reliability. Each exercise has:

- a name
- a short summary
- a focus list
- a workout route

Exercise metadata lives in `lib/exercises.ts`.

### 3. Camera Workout

The workout page:

- requests webcam access with `navigator.mediaDevices.getUserMedia()`
- renders the live video in the browser
- loads the MediaPipe pose model
- runs frame-by-frame pose detection
- draws pose landmarks and skeleton lines on a canvas overlay

### 4. Rule-Based Coaching

The MVP does not attempt full biomechanics analysis. It uses simple heuristics from `lib/pose-analysis.ts`:

- squat:
  - hip depth
  - torso lean
- push-up:
  - elbow angle
  - shoulder-hip-ankle alignment
- lunge:
  - lead knee angle
  - front knee travel

### 5. Progress

When a workout session ends, the app saves a summary with:

- exercise name
- reps
- average form score
- session duration
- most common correction

These summaries are shown on the progress page and reused for dashboard metrics.

## Local Storage

This MVP uses browser `localStorage` keys defined in `lib/storage.ts`:

- `viscoach.profile`
- `viscoach.sessions`

This means:

- data is browser-specific
- data is device-specific
- clearing browser storage resets the demo

There is also a `Reset demo` action in the app shell that clears saved profile and session data.

## MediaPipe Notes

The app currently loads MediaPipe WebAssembly and model assets from external URLs at runtime.

Specifically:

- WASM bundle from `jsdelivr`
- pose model from `storage.googleapis.com`

If those requests are blocked, the camera page can load but pose tracking will fail.

## Camera Notes

### Webcam permissions

The browser must be allowed to use the webcam. If camera access is denied, the workout screen will not start.

### Auto-framing / face-following on Mac

If the camera appears to zoom or keep your face centered, that is usually not caused by this repo or by MediaPipe itself. It is typically caused by the selected camera source or macOS/iPhone Continuity Camera effects such as Center Stage.

Before debugging the app, verify the same behavior in QuickTime, Photo Booth, or another webcam app.

### Framing for best pose detection

For the cleanest squat and lunge tracking:

- keep your whole body visible
- keep ankles in frame
- stand farther back than feels necessary
- rotate slightly side-on when needed

The workout page includes a preview fit toggle so the full feed can be shown without panel cropping.

## Development Notes

### No backend

There is no API, database, or auth flow in this version.

### No environment variables required

You can clone and run the project without a `.env` file.

### Styling

Global styles live in `app/globals.css`.

### Shared app state

App-wide state and persistence are managed in `components/app-state-provider.tsx`.

## Common Teammate Tasks

### Add a new exercise

1. Add exercise metadata in `lib/exercises.ts`
2. Extend the pose analysis logic in `lib/pose-analysis.ts`
3. Open the new route through `/coach/workout/[exercise]`
4. Update any dashboard or progress copy if needed

### Adjust onboarding options

Update:

- `types/viscoach.ts`
- `components/onboarding-flow.tsx`

### Change session persistence

Update:

- `lib/storage.ts`
- `components/app-state-provider.tsx`

## Troubleshooting

### `npm run dev` fails to start

Check:

- Node version
- whether another app is already using port `3000`

### Pose model fails to load

Check:

- internet connection
- browser console
- access to `jsdelivr` and `storage.googleapis.com`

### Camera opens but tracking is unreliable

Check:

- full body visibility
- lighting
- camera distance
- whether macOS or Continuity Camera is auto-framing the subject

### Progress page looks empty

That is expected until at least one workout has been started and saved.

## Recommended Verification Before Merging

Run:

```bash
npm run typecheck
npm run build
```

Then manually verify:

- onboarding completes
- library loads
- a workout route opens
- webcam access works
- ending a workout creates a progress entry

## Future Improvements

Likely next steps if the team continues this MVP:

- add a camera selector with `enumerateDevices()`
- support more robust exercise-specific tracking requirements
- persist data to a backend instead of `localStorage`
- add real workout programs and histories
- move MediaPipe assets to local hosting or a more controlled deployment path
