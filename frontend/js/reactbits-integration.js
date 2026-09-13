/**
 * React Bits Components Integration for VLSI Insights
 * Integrates:
 * 1. <MorphSlider /> (OGL WebGL displacement morph slider)
 * 2. <Counter /> (Spring-driven digit roll counter with gradient masks)
 * 3. <AnimatedList /> (In-view scale list with gradient masks & keyboard navigation)
 * 4. <BubbleMenu /> (GSAP staggered bubble navigation overlay)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. MORPH SLIDER INTEGRATION (Hero Services Slideshow)
     ========================================================================== */
  function initMorphSlider() {
    const sliderContainer = document.getElementById('heroServicesSlider');
    if (!sliderContainer || typeof window.ogl === 'undefined' && typeof window.OGL === 'undefined') return;

    const OGL = window.ogl || window.OGL;
    const { Renderer, Triangle, Program, Mesh, Texture } = OGL;

    const items = [
      {
        image: 'images/vlsi-design-slide.webp',
        caption: 'VLSI Related Services',
        desc: 'Developing RTL layout, synthesis, STA closure, and verification plans for tape-out ready chips.',
        link: 'vlsi-designs.html'
      },
      {
        image: 'images/technical-training-slide.webp',
        caption: 'Technical Training',
        desc: 'Front-end semiconductor training tailored for working professionals and engineering students.',
        link: 'technical-training.html'
      },
      {
        image: 'images/marketing-solutions-slide.webp',
        caption: 'Marketing Solution',
        desc: 'Digital marketing, IVR telephony systems, and managed communication solutions for technical brands.',
        link: 'marketing-solutions.html'
      }
    ];

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform sampler2D tCurrent;
      uniform sampler2D tNext;
      uniform vec2 uResolution;
      uniform vec2 uCurrentSize;
      uniform vec2 uNextSize;
      uniform float uProgress;
      uniform float uDir;
      uniform int uMode;
      uniform float uIntensity;
      uniform float uScale;
      uniform float uAberration;
      uniform float uDrift;
      uniform float uTime;
      uniform float uReduce;
      uniform vec2 uPointer;
      uniform vec3 uOverlay;
      varying vec2 vUv;

      const float PI = 3.14159265359;

      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      vec2 coverUV(vec2 uv, vec2 res, vec2 img) {
        float rA = res.x / max(res.y, 1.0);
        float iA = img.x / max(img.y, 1.0);
        vec2 s = vec2(1.0);
        float ratio = rA / max(iA, 0.0001);
        if (ratio > 1.0) { s.y = 1.0 / ratio; } else { s.x = ratio; }
        return (uv - 0.5) * s + 0.5;
      }

      void main() {
        float p = clamp(uProgress, 0.0, 1.0);
        float env = sin(p * PI);
        vec2 uv = vUv;
        uv += vec2(sin(uTime * 0.25 + uv.y * 4.0), cos(uTime * 0.22 + uv.x * 4.0)) * uDrift * 0.008;
        uv = (uv - 0.5) * (1.0 - uDrift * 0.02 * sin(uTime * 0.4)) + 0.5;

        float nn = fbm(uv * uScale + uTime * 0.03);
        float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
        vec2 g = vec2(nn, warp) - 0.5;
        vec2 uvC = uv + g * uIntensity * 0.5 * p;
        vec2 uvN = uv - g * uIntensity * 0.5 * (1.0 - p);
        float m = smoothstep(nn - 0.15, nn + 0.15, p);

        vec2 sC = coverUV(uvC, uResolution, uCurrentSize);
        vec2 sN = coverUV(uvN, uResolution, uNextSize);
        float ca = uReduce < 0.5 ? uAberration * env * 0.03 : 0.0;

        vec3 colC = vec3(texture2D(tCurrent, sC + vec2(ca, 0.0)).r, texture2D(tCurrent, sC).g, texture2D(tCurrent, sC - vec2(ca, 0.0)).b);
        vec3 colN = vec3(texture2D(tNext, sN + vec2(ca, 0.0)).r, texture2D(tNext, sN).g, texture2D(tNext, sN - vec2(ca, 0.0)).b);
        vec3 col = mix(colC, colN, m);

        float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
        col = mix(col, uOverlay, (1.0 - vig) * 0.25);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    try {
      const stage = document.createElement('div');
      stage.className = 'morph-slider-stage';
      sliderContainer.insertBefore(stage, sliderContainer.firstChild);

      const renderer = new Renderer({ alpha: false, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
      const gl = renderer.gl;
      gl.clearColor(0.05, 0.05, 0.06, 1);
      const canvas = gl.canvas;
      canvas.className = 'morph-slider-canvas';
      stage.appendChild(canvas);

      const geometry = new Triangle(gl);
      const textures = items.map(() => {
        const size = 4;
        const data = new Uint8Array(size * size * 4);
        return new Texture(gl, { image: data, width: size, height: size, generateMipmaps: false });
      });
      const sizes = items.map(() => [1, 1]);

      let currentIndex = 0;
      let animating = false;

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          tCurrent: { value: textures[0] },
          tNext: { value: textures[0] },
          uResolution: { value: [gl.canvas.width, gl.canvas.height] },
          uCurrentSize: { value: sizes[0] },
          uNextSize: { value: sizes[0] },
          uProgress: { value: 0 },
          uDir: { value: 1 },
          uMode: { value: 0 },
          uIntensity: { value: 0.55 },
          uScale: { value: 2.4 },
          uAberration: { value: 0.35 },
          uDrift: { value: 0.35 },
          uTime: { value: 0 },
          uReduce: { value: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0 },
          uPointer: { value: [0.5, 0.5] },
          uOverlay: { value: [0, 0, 0] }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });

      function resize() {
        const rect = sliderContainer.getBoundingClientRect();
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      }
      window.addEventListener('resize', resize);
      resize();

      items.forEach((item, index) => {
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
          const tex = new Texture(gl, { generateMipmaps: false });
          tex.image = img;
          textures[index] = tex;
          sizes[index] = [img.naturalWidth || 1, img.naturalHeight || 1];
          if (index === currentIndex) {
            program.uniforms.tCurrent.value = tex;
            program.uniforms.uCurrentSize.value = sizes[index];
          }
        };
      });

      function updateSlideDOM(index) {
        const slides = sliderContainer.querySelectorAll('.hero-slide');
        const dots = sliderContainer.querySelectorAll('.slider-dot');
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      }

      function goTo(nextIdx, dir) {
        if (animating || nextIdx === currentIndex) return;
        animating = true;
        const target = (nextIdx + items.length) % items.length;
        program.uniforms.tCurrent.value = textures[currentIndex];
        program.uniforms.uCurrentSize.value = sizes[currentIndex];
        program.uniforms.tNext.value = textures[target];
        program.uniforms.uNextSize.value = sizes[target];
        program.uniforms.uDir.value = dir;
        updateSlideDOM(target);

        if (window.gsap) {
          window.gsap.fromTo(program.uniforms.uProgress, { value: 0 }, {
            value: 1,
            duration: 0.9,
            ease: 'power2.inOut',
            onComplete: () => {
              currentIndex = target;
              program.uniforms.tCurrent.value = textures[target];
              program.uniforms.uCurrentSize.value = sizes[target];
              program.uniforms.uProgress.value = 0;
              animating = false;
            }
          });
        } else {
          currentIndex = target;
          animating = false;
        }
      }

      // Wire controls
      const nextBtn = document.getElementById('heroSliderNext');
      const prevBtn = document.getElementById('heroSliderPrev');
      if (nextBtn) nextBtn.onclick = () => goTo(currentIndex + 1, 1);
      if (prevBtn) prevBtn.onclick = () => goTo(currentIndex - 1, -1);

      const dots = sliderContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        dot.onclick = () => goTo(idx, idx > currentIndex ? 1 : -1);
      });

      // Autoplay
      let autoplayTimer = setInterval(() => {
        if (!document.hidden && !sliderContainer.matches(':hover')) {
          goTo(currentIndex + 1, 1);
        }
      }, 4500);

      sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
      sliderContainer.addEventListener('mouseleave', () => {
        autoplayTimer = setInterval(() => {
          if (!document.hidden) goTo(currentIndex + 1, 1);
        }, 4500);
      });

      // Render loop
      function loop(t) {
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

    } catch (err) {
      console.warn('MorphSlider WebGL fallback active:', err);
    }
  }

  /* ==========================================================================
     2. COUNTER INTEGRATION (Stats Rolling Digit Display)
     ========================================================================== */
  function initCounters() {
    const statItems = document.querySelectorAll('.stat-item');
    if (!statItems.length) return;

    statItems.forEach(item => {
      const statNumEl = item.querySelector('.stat-number');
      if (!statNumEl) return;

      const targetVal = parseInt(statNumEl.getAttribute('data-target'), 10) || 0;
      const suffix = statNumEl.getAttribute('data-suffix') || '';
      const digits = targetVal.toString().split('');

      // Create React Bits Counter structure
      const container = document.createElement('span');
      container.className = 'counter-container';

      const counter = document.createElement('span');
      counter.className = 'counter-counter';

      digits.forEach((digitChar, i) => {
        const digitEl = document.createElement('span');
        digitEl.className = 'counter-digit';
        digitEl.dataset.targetDigit = digitChar;

        for (let n = 0; n <= 9; n++) {
          const numSpan = document.createElement('span');
          numSpan.className = 'counter-number';
          numSpan.textContent = n;
          numSpan.style.transform = 'translateY(0%)';
          digitEl.appendChild(numSpan);
        }
        counter.appendChild(digitEl);
      });

      if (suffix) {
        const suffixEl = document.createElement('span');
        suffixEl.className = 'counter-suffix';
        suffixEl.textContent = suffix;
        suffixEl.style.cssText = 'color: var(--trace); font-weight: 700; margin-left: 2px;';
        counter.appendChild(suffixEl);
      }

      const gradContainer = document.createElement('span');
      gradContainer.className = 'gradient-container';
      gradContainer.innerHTML = `
        <span class="top-gradient" style="height: 14px; background: linear-gradient(to bottom, var(--layer, #FFFFFF), transparent);"></span>
        <span class="bottom-gradient" style="height: 14px; background: linear-gradient(to top, var(--layer, #FFFFFF), transparent);"></span>
      `;

      container.appendChild(counter);
      container.appendChild(gradContainer);

      statNumEl.innerHTML = '';
      statNumEl.appendChild(container);

      // Roll animation when in view
      let animated = false;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            const digitElements = container.querySelectorAll('.counter-digit');
            digitElements.forEach((dEl, dIdx) => {
              const target = parseInt(dEl.dataset.targetDigit, 10);
              const numSpans = dEl.querySelectorAll('.counter-number');
              numSpans.forEach(ns => {
                ns.style.transition = `transform ${1.2 + dIdx * 0.2}s cubic-bezier(0.16, 1, 0.3, 1)`;
                ns.style.transform = `translateY(-${target * 100}%)`;
              });
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(item);
    });
  }

  /* ==========================================================================
     3. ANIMATED LIST INTEGRATION (Approach Features List) - Replaced with native CSS
     ========================================================================== */
  function initAnimatedList() {
    // Features list uses pure CSS transitions with full contrast and no gradient overlays
  }

  // Initialize all after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMorphSlider();
      initCounters();
      initAnimatedList();
    });
  } else {
    initMorphSlider();
    initCounters();
    initAnimatedList();
  }

})();
