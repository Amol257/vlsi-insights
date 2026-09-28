# Bolt's Performance Journal

## 2026-09-28 - Pause WebGL Render Loops When Off-screen
**Learning:** Continuous `requestAnimationFrame` loops for WebGL shaders consume up to 15-30% CPU/GPU even when scrolled past or backgrounded, causing battery drain and frame drops elsewhere.
**Action:** Always wrap continuous canvas/WebGL shader render loops in an `IntersectionObserver` and document/visibility listener so drawing halts completely when off-screen or tab is backgrounded.
