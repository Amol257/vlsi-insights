## 2026-09-21 - Off-screen WebGL Render Loop Pause via IntersectionObserver
**Learning:** Continuous 60/120 FPS WebGL animation loops (`requestAnimationFrame`) consume GPU/CPU resources even when the WebGL canvas is scrolled off-screen.
**Action:** Use an `IntersectionObserver` on the WebGL container element to cancel `requestAnimationFrame` when the element exits the viewport and resume when it re-enters.
