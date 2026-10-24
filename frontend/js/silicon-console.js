/**
 * VLSI Insights - Interactive Silicon Signoff & Waveform Console Engine
 * Renders real-time 60fps multi-channel logic analyzer waveforms, interactive probes,
 * frequency modulators, and dynamic STA/UVM/Power signoff metrics.
 */
(function () {
  'use strict';

  function initSiliconWaveform() {
    const canvas = document.getElementById('siliconWaveformCanvas');
    const container = document.getElementById('waveformContainer');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Controls & DOM Elements
    const playBtn = document.getElementById('waveformPlayBtn');
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    const speedBtn = document.getElementById('waveformSpeedBtn');
    const speedText = document.getElementById('speedText');
    const freqSlider = document.getElementById('consoleFreqSlider');
    const freqVal = document.getElementById('consoleFreqVal');
    const probeTime = document.getElementById('probeTime');
    const probeClk = document.getElementById('probeClk');
    const probeReq = document.getElementById('probeReq');
    const probeAck = document.getElementById('probeAck');
    const cycleCounter = document.getElementById('consoleLiveCycle');
    const statusPill = document.getElementById('consoleStatusPill');
    const statusText = document.getElementById('consoleStatusText');
    const domainTitle = document.getElementById('waveformDomainTitle');
    const windowPill = document.getElementById('waveformWindowPill');
    const footerStatus = document.getElementById('consoleFooterStatus');
    const signoffBadge = document.getElementById('consoleSignoffBadge');

    // Report Tabs
    const tabSta = document.getElementById('tabSta');
    const tabUvm = document.getElementById('tabUvm');
    const tabPower = document.getElementById('tabPower');
    const tabs = [tabSta, tabUvm, tabPower].filter(Boolean);

    // Metrics DOM elements
    const mLabel1 = document.getElementById('mLabel1');
    const mSub1 = document.getElementById('mSub1');
    const mVal1 = document.getElementById('mVal1');
    const mTag1 = document.getElementById('mTag1');

    const mLabel2 = document.getElementById('mLabel2');
    const mSub2 = document.getElementById('mSub2');
    const mVal2 = document.getElementById('mVal2');
    const mTag2 = document.getElementById('mTag2');

    const mLabel3 = document.getElementById('mLabel3');
    const mSub3 = document.getElementById('mSub3');
    const mVal3 = document.getElementById('mVal3');
    const mTag3 = document.getElementById('mTag3');

    const mLabel4 = document.getElementById('mLabel4');
    const mSub4 = document.getElementById('mSub4');
    const mVal4 = document.getElementById('mVal4');
    const mTag4 = document.getElementById('mTag4');

    // Engine State
    let isPlaying = true;
    let speedMultiplier = 1.0;
    const speedOptions = [1.0, 1.5, 2.0, 0.5];
    let speedIndex = 0;
    let clockFreq = 1.2; // GHz
    let activeMode = 'sta'; // 'sta', 'uvm', 'power'
    let currentCycle = 1842910;
    let timeOffset = 0;
    let hoverX = null;
    let animId = null;

    // Report Mode Configurations
    const modeConfigs = {
      sta: {
        status: 'TIMING MET: +0.142ns',
        pillClass: 'artifact-status-pill',
        domain: 'Multi-Cycle Clock Domain & Handshake Protocol Analyzer',
        window: 'SETUP: 120ps | HOLD: 45ps',
        footer: '0 setup violations | 0 hold violations | 14,820 / 14,820 SVA properties passed',
        signoff: 'Signoff Ready',
        m1: { label: 'CLOCK TARGET', sub: 'SYS_CLK', val: `${clockFreq.toFixed(1)} GHz`, tag: `${Math.round(1000 / clockFreq)} ps` },
        m2: { label: 'WORST SLACK (WNS)', sub: 'SETUP', val: '+0.142 ns', tag: 'MET' },
        m3: { label: 'UVM COVERAGE', sub: 'REGRESSION', val: '98.6%', tag: 'CLOSURE' },
        m4: { label: 'TOTAL SLACK (TNS)', sub: 'ALL PATHS', val: '0.000 ns', tag: 'CLEAN' }
      },
      uvm: {
        status: 'COVERAGE: 99.4% CLOSED',
        pillClass: 'artifact-status-pill',
        domain: 'UVM Constrained-Random Protocol Verification Testbench',
        window: 'SVA ASSERTIONS: 100% | BINS: 4,096',
        footer: '100% functional coverage | Zero race conditions | Scoreboard checks: 2.8M verified',
        signoff: 'Coverage Closed',
        m1: { label: 'TESTBENCH CYCLES', sub: 'REGRESSION', val: '12.4M', tag: 'ACTIVE' },
        m2: { label: 'ASSERTIONS (SVA)', sub: 'FORMAL', val: '14,820', tag: '100% PASS' },
        m3: { label: 'FUNCTIONAL COV', sub: 'CROSS-BINS', val: '99.4%', tag: 'VERIFIED' },
        m4: { label: 'CODE COVERAGE', sub: 'BRANCH/COND', val: '98.8%', tag: 'CLOSED' }
      },
      power: {
        status: 'POWER OPTIMAL: 18.4 mW',
        pillClass: 'artifact-status-pill',
        domain: 'Dynamic Clock Gating & Multi-Voltage Power Analysis',
        window: 'VDD: 0.75V | VSS: 0.00V | LEAKAGE: 1.2mW',
        footer: 'Clock gating efficiency: 94.6% | Peak IR-drop: 14mV | Thermal headroom: 32°C',
        signoff: 'Power Signoff',
        m1: { label: 'DYNAMIC POWER', sub: 'SWITCHING', val: '18.4 mW', tag: 'OPTIMAL' },
        m2: { label: 'LEAKAGE POWER', sub: 'STATIC', val: '1.2 mW', tag: 'SUB-THRESHOLD' },
        m3: { label: 'CG EFFICIENCY', sub: 'AUTOMATED', val: '94.6%', tag: 'TARGET MET' },
        m4: { label: 'IR-DROP MARGIN', sub: 'RAIL SIGN-OFF', val: '14 mV', tag: 'PASS' }
      }
    };

    function updateModeUI(mode) {
      activeMode = mode;
      const cfg = modeConfigs[mode];
      if (!cfg) return;

      tabs.forEach(t => {
        const isSelected = t.getAttribute('data-mode') === mode;
        t.classList.toggle('active', isSelected);
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      if (statusText) statusText.textContent = cfg.status;
      if (domainTitle) domainTitle.textContent = cfg.domain;
      if (windowPill) windowPill.textContent = cfg.window;
      if (footerStatus) footerStatus.textContent = cfg.footer;
      if (signoffBadge) signoffBadge.textContent = cfg.signoff;

      if (mLabel1) mLabel1.textContent = cfg.m1.label;
      if (mSub1) mSub1.textContent = cfg.m1.sub;
      if (mVal1) mVal1.textContent = mode === 'sta' ? `${clockFreq.toFixed(1)} GHz` : cfg.m1.val;
      if (mTag1) mTag1.textContent = mode === 'sta' ? `${Math.round(1000 / clockFreq)} ps` : cfg.m1.tag;

      if (mLabel2) mLabel2.textContent = cfg.m2.label;
      if (mSub2) mSub2.textContent = cfg.m2.sub;
      if (mVal2) mVal2.textContent = cfg.m2.val;
      if (mTag2) mTag2.textContent = cfg.m2.tag;

      if (mLabel3) mLabel3.textContent = cfg.m3.label;
      if (mSub3) mSub3.textContent = cfg.m3.sub;
      if (mVal3) mVal3.textContent = cfg.m3.val;
      if (mTag3) mTag3.textContent = cfg.m3.tag;

      if (mLabel4) mLabel4.textContent = cfg.m4.label;
      if (mSub4) mSub4.textContent = cfg.m4.sub;
      if (mVal4) mVal4.textContent = cfg.m4.val;
      if (mTag4) mTag4.textContent = cfg.m4.tag;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode') || 'sta';
        updateModeUI(mode);
      });
    });

    // Play/Pause Controller
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (playText) playText.textContent = isPlaying ? 'Pause' : 'Resume';
        if (playBtn) playBtn.classList.toggle('active', !isPlaying);
        if (playIcon) {
          playIcon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
          if (window.lucide && lucide.createIcons) lucide.createIcons();
        }
      });
    }

    // Speed Multiplier Controller
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speedOptions.length;
        speedMultiplier = speedOptions[speedIndex];
        if (speedText) speedText.textContent = `${speedMultiplier.toFixed(1)}x`;
      });
    }

    // Frequency Slider
    if (freqSlider) {
      freqSlider.addEventListener('input', (e) => {
        clockFreq = parseFloat(e.target.value);
        if (freqVal) freqVal.textContent = `${clockFreq.toFixed(1)} GHz`;
        if (activeMode === 'sta') {
          if (mVal1) mVal1.textContent = `${clockFreq.toFixed(1)} GHz`;
          if (mTag1) mTag1.textContent = `${Math.round(1000 / clockFreq)} ps`;
        }
      });
    }

    // Canvas Sizing & High-DPI
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height || 290;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Channel Layout Definitions
    const channels = [
      { name: 'SYS_CLK', color: '#00E5A3', type: 'clock', y: 0.16 },
      { name: 'AXI_REQ', color: '#38BDF8', type: 'digital', y: 0.38 },
      { name: 'AXI_ACK', color: '#A855F7', type: 'digital', y: 0.60 },
      { name: 'DATA[63:0]', color: '#F59E0B', type: 'bus', y: 0.82 }
    ];

    const dataWords = ['0x5A5A_C3C3', '0xDEAD_BEEF', '0xCAFE_0001', '0x8086_0042', '0x00FF_1234', '0xA5A5_F0F0'];

    // Interactive Probe Hover
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      hoverX = e.clientX - rect.left;
    });

    container.addEventListener('mouseleave', () => {
      hoverX = null;
    });

    // Waveform Math & Sampling
    function getSignalState(channelIdx, t) {
      const clkPeriod = 40 / clockFreq;

      if (channelIdx === 0) {
        const phase = (t % clkPeriod) / clkPeriod;
        return phase < 0.5 ? 1 : 0;
      }

      if (channelIdx === 1) {
        const burstPeriod = clkPeriod * 6;
        const phase = (t % burstPeriod);
        return (phase > clkPeriod && phase < clkPeriod * 3) ? 1 : 0;
      }

      if (channelIdx === 2) {
        const burstPeriod = clkPeriod * 6;
        const phase = (t % burstPeriod);
        return (phase > clkPeriod * 2 && phase < clkPeriod * 3.5) ? 1 : 0;
      }

      if (channelIdx === 3) {
        const busPeriod = clkPeriod * 3;
        const wordIdx = Math.floor(t / busPeriod) % dataWords.length;
        return dataWords[wordIdx >= 0 ? wordIdx : 0];
      }

      return 0;
    }

    // Main 60fps Animation Loop
    let lastTime = performance.now();

    function render(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        timeOffset += dt * 60 * speedMultiplier * (clockFreq / 1.2);
        currentCycle += Math.floor(dt * 240 * speedMultiplier);
        if (cycleCounter && Math.random() < 0.3) {
          cycleCounter.textContent = `#${currentCycle.toLocaleString()}`;
        }
      }

      // Background Clear
      ctx.fillStyle = '#020409';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines & Time Markers
      const gridStep = 40;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Channel Baseline Rows & Dividers
      channels.forEach((ch, idx) => {
        const rowY = ch.y * height;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(70, rowY + 16);
        ctx.lineTo(width, rowY + 16);
        ctx.stroke();

        ctx.fillStyle = '#111827';
        ctx.fillRect(6, rowY - 14, 60, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(6, rowY - 14, 60, 24);

        ctx.fillStyle = ch.color;
        ctx.font = 'bold 9px "Space Grotesk", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch.name, 36, rowY - 2);
      });

      // Render Signal Traces
      const startX = 72;
      const activeWidth = width - startX;
      const clkPeriod = 40 / clockFreq;
      const amp = 14;

      channels.forEach((ch, idx) => {
        const rowY = ch.y * height;
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.75;
        ctx.shadowColor = ch.color;
        ctx.shadowBlur = 4;

        if (ch.type === 'clock' || ch.type === 'digital') {
          ctx.beginPath();
          let prevY = 0;

          for (let x = 0; x <= activeWidth; x += 2) {
            const screenX = startX + x;
            const t = screenX + timeOffset;
            const state = getSignalState(idx, t);
            const sigY = state === 1 ? rowY - amp : rowY + amp;

            if (x === 0) {
              ctx.moveTo(screenX, sigY);
            } else {
              if (prevY !== sigY) {
                ctx.lineTo(screenX, prevY);
                ctx.lineTo(screenX, sigY);
              } else {
                ctx.lineTo(screenX, sigY);
              }
            }
            prevY = sigY;
          }
          ctx.stroke();
        } else if (ch.type === 'bus') {
          const busPeriod = clkPeriod * 3;
          ctx.beginPath();

          for (let x = 0; x <= activeWidth; x += 2) {
            const screenX = startX + x;
            const t = screenX + timeOffset;
            const phase = t % busPeriod;
            const isTransition = phase < 6;

            const topY = isTransition ? rowY : rowY - amp;

            if (x === 0) {
              ctx.moveTo(screenX, topY);
            } else {
              ctx.lineTo(screenX, topY);
            }
          }
          ctx.stroke();

          ctx.beginPath();
          for (let x = 0; x <= activeWidth; x += 2) {
            const screenX = startX + x;
            const t = screenX + timeOffset;
            const phase = t % busPeriod;
            const isTransition = phase < 6;
            const botY = isTransition ? rowY : rowY + amp;

            if (x === 0) {
              ctx.moveTo(screenX, botY);
            } else {
              ctx.lineTo(screenX, botY);
            }
          }
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.font = '10px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FDE68A';

          const visibleSlots = Math.ceil(activeWidth / busPeriod) + 1;
          const firstSlotIdx = Math.floor((startX + timeOffset) / busPeriod);

          for (let s = 0; s < visibleSlots; s++) {
            const slotIdx = firstSlotIdx + s;
            const slotStartT = slotIdx * busPeriod;
            const slotScreenX = slotStartT - timeOffset + (busPeriod / 2);

            if (slotScreenX > startX + 25 && slotScreenX < width - 25) {
              const word = dataWords[slotIdx % dataWords.length];
              ctx.fillText(word, slotScreenX, rowY);
            }
          }
        }
      });

      ctx.shadowBlur = 0;

      // Interactive Probe Line
      const probeTargetX = hoverX !== null ? hoverX : width * 0.58;

      if (probeTargetX >= startX && probeTargetX <= width) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(probeTargetX, 0);
        ctx.lineTo(probeTargetX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(probeTargetX - 6, 0);
        ctx.lineTo(probeTargetX + 6, 0);
        ctx.lineTo(probeTargetX, 8);
        ctx.closePath();
        ctx.fill();

        const sampleT = probeTargetX + timeOffset;
        const sampledClk = getSignalState(0, sampleT);
        const sampledReq = getSignalState(1, sampleT);
        const sampledAck = getSignalState(2, sampleT);
        const sampleTimeNs = ((sampleT / 40) * (1 / clockFreq)).toFixed(2);

        if (probeTime) probeTime.textContent = sampleTimeNs;
        if (probeClk) probeClk.textContent = sampledClk;
        if (probeReq) probeReq.textContent = sampledReq;
        if (probeAck) probeAck.textContent = sampledAck;

        channels.forEach((ch, idx) => {
          const rowY = ch.y * height;
          let nodeY = rowY;
          if (ch.type === 'clock' || ch.type === 'digital') {
            const state = getSignalState(idx, sampleT);
            nodeY = state === 1 ? rowY - amp : rowY + amp;
          }

          ctx.fillStyle = ch.color;
          ctx.beginPath();
          ctx.arc(probeTargetX, nodeY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    updateModeUI('sta');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiliconWaveform);
  } else {
    initSiliconWaveform();
  }
})();
