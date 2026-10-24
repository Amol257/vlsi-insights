/**
 * ============================================================================
 * SILICON 3D WAFER & MICRO-DIE VISUALIZER
 * High-performance WebGL 3D Silicon Wafer component with thin-film iridescence,
 * die grid array, pointer-tracking spring physics, and mobile scroll-safe touch.
 * ============================================================================
 */
(function () {
  'use strict';

  function initSilicon3DWafer() {
    const container = document.getElementById('siliconWaferStage');
    if (!container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.classList.add('reduced-motion-fallback');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'silicon-wafer-canvas';
    canvas.setAttribute('aria-label', 'Interactive 3D Silicon Wafer Model');
    container.insertBefore(canvas, container.firstChild);

    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, powerPreference: 'high-performance' });
    if (!gl) {
      container.classList.add('no-webgl-fallback');
      return;
    }

    // Vertex shader for 3D wafer disk & die mesh
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec2 aUv;
      uniform mat4 uProjection;
      uniform mat4 uModelView;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = aUv;
        vPosition = aPosition;
        vNormal = normalize(vec3(aPosition.x, aPosition.y, 1.5));
        gl_Position = uProjection * uModelView * vec4(aPosition, 1.0);
      }
    `;

    // Fragment shader with thin-film silicon iridescence & laser scribe lines
    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform float uTheme; // 1.0 dark, 0.0 light

      // Spectral thin-film color generator (silicon rainbow diffraction)
      vec3 spectral(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);

        // Wafer outer circular perimeter clamp (with wafer notch at bottom)
        float notch = step(0.92, r) * step(abs(p.x), 0.08) * step(p.y, -0.85);
        if (r > 0.98 || notch > 0.5) {
          discard;
        }

        // 3D Lighting & Normal reflection
        vec3 lightDir = normalize(vec3(uPointer.x * 1.5, uPointer.y * 1.5, 2.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);

        float NdotL = max(dot(vNormal, lightDir), 0.0);
        float specAngle = max(dot(vNormal, halfDir), 0.0);
        float specular = pow(specAngle, 32.0);

        // Orthogonal Silicon Die Grid (stepped lithography channels)
        vec2 dieGrid = abs(fract(p * 7.5) - 0.5);
        float scribeLine = smoothstep(0.44, 0.49, max(dieGrid.x, dieGrid.y));

        // Thin-film interference spectral phase based on view angle and lighting
        float iridPhase = (vPosition.x * 1.2 + vPosition.y * 0.8 + uTime * 0.15) + (specular * 1.5);
        vec3 iridColor = spectral(iridPhase);

        // Silicon Substrate Base Tone
        vec3 baseSilicon = mix(vec3(0.06, 0.08, 0.12), vec3(0.02, 0.15, 0.12), clamp(NdotL, 0.0, 1.0));
        if (uTheme < 0.5) {
          baseSilicon = mix(vec3(0.12, 0.16, 0.22), vec3(0.05, 0.22, 0.18), clamp(NdotL, 0.0, 1.0));
        }

        // Inner die circuitry reflection
        vec2 subDie = fract(p * 30.0);
        float microCircuit = step(0.15, subDie.x) * step(0.15, subDie.y) * 0.15;

        // Composite wafer color: Silicon body + Iridescent diffraction + Scribe channels + Beveled rim
        vec3 color = mix(baseSilicon, iridColor * 0.85, clamp(specular * 0.6 + microCircuit, 0.0, 0.8));

        // Dark laser scribe channels between chip dies
        color = mix(color, vec3(0.01, 0.02, 0.03), scribeLine * 0.85);

        // Outer wafer polished bevel rim
        float rim = smoothstep(0.94, 0.98, r);
        color = mix(color, vec3(0.0, 0.85, 0.68), rim * 0.9);

        // Core Center Die Highlight
        float centerDie = step(abs(p.x), 0.14) * step(abs(p.y), 0.14);
        float pulse = 0.5 + 0.5 * sin(uTime * 3.0);
        color += vec3(0.0, 0.7, 0.55) * centerDie * 0.35 * pulse;

        // Subtle Ambient Vignette
        color *= (1.0 - smoothstep(0.85, 1.0, r) * 0.4);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile failure:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link failure:', gl.getProgramInfoLog(program));
      return;
    }

    // Generate circular disc geometry
    const segments = 64;
    const positions = [0, 0, 0];
    const uvs = [0.5, 0.5];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta);
      const y = Math.sin(theta);
      positions.push(x, y, 0);
      uvs.push((x + 1) * 0.5, (y + 1) * 0.5);
      if (i > 0) {
        indices.push(0, i, i + 1);
      }
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    const aUvLoc = gl.getAttribLocation(program, 'aUv');
    const uProjLoc = gl.getUniformLocation(program, 'uProjection');
    const uMvLoc = gl.getUniformLocation(program, 'uModelView');
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uPointerLoc = gl.getUniformLocation(program, 'uPointer');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
    const uThemeLoc = gl.getUniformLocation(program, 'uTheme');

    // Matrix helper math
    function createPerspectiveMatrix(fov, aspect, near, far) {
      const f = 1.0 / Math.tan(fov / 2);
      const nf = 1 / (near - far);
      return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
      ];
    }

    function createModelViewMatrix(rotX, rotY, rotZ, tz) {
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      // Composite rotation matrix Rz * Ry * Rx with translation
      return [
        cosY * cosZ, cosX * sinZ + sinX * sinY * cosZ, sinX * sinZ - cosX * sinY * cosZ, 0,
        -cosY * sinZ, cosX * cosZ - sinX * sinY * sinZ, sinX * cosZ + cosX * sinY * sinZ, 0,
        sinY, -sinX * cosY, cosX * cosY, 0,
        0, 0, tz, 1
      ];
    }

    let targetRotX = 0.25;
    let targetRotY = -0.3;
    let currentRotX = 0.25;
    let currentRotY = -0.3;
    let autoRotZ = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let isHovering = false;

    // Interaction handlers
    container.addEventListener('pointermove', (e) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      pointerX = nx;
      pointerY = ny;
      targetRotY = (nx - 0.5) * 0.8;
      targetRotX = (0.5 - ny) * 0.8 + 0.2;
      isHovering = true;
    });

    container.addEventListener('pointerleave', () => {
      targetRotX = 0.25;
      targetRotY = -0.3;
      pointerX = 0.5;
      pointerY = 0.5;
      isHovering = false;
    });

    function resize() {
      const rect = container.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0);
      const width = Math.max(Math.floor(rect.width * dpr), 100);
      const height = Math.max(Math.floor(rect.height * dpr), 100);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    window.addEventListener('resize', resize);
    resize();

    let startTime = performance.now();
    let animId = null;

    function render() {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000.0;

      // Spring physics toward target tilt
      const springK = isHovering ? 0.08 : 0.04;
      currentRotX += (targetRotX - currentRotX) * springK;
      currentRotY += (targetRotY - currentRotY) * springK;
      autoRotZ += 0.003;

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      gl.useProgram(program);

      const aspect = canvas.width / canvas.height;
      const projectionMatrix = createPerspectiveMatrix((45 * Math.PI) / 180, aspect, 0.1, 100.0);
      const modelViewMatrix = createModelViewMatrix(currentRotX, currentRotY, autoRotZ, -2.5);

      gl.uniformMatrix4fv(uProjLoc, false, new Float32Array(projectionMatrix));
      gl.uniformMatrix4fv(uMvLoc, false, new Float32Array(modelViewMatrix));
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uPointerLoc, pointerX, pointerY);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.body.classList.contains('dark-mode');
      gl.uniform1f(uThemeLoc, isDark ? 1.0 : 0.0);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(aPositionLoc);
      gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.enableVertexAttribArray(aUvLoc);
      gl.vertexAttribPointer(aUvLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      animId = requestAnimationFrame(render);
    }

    // Only run render loop when in viewport to conserve energy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animId) animId = requestAnimationFrame(render);
        } else {
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSilicon3DWafer);
  } else {
    initSilicon3DWafer();
  }
})();
