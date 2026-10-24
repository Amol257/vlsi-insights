/**
 * services-showcase.js
 * Streamlined & compact interactive controller for the 6-Services Showcase Panel
 * VLSI Insights - Engineering Practices
 */

(function () {
  'use strict';

  const servicesData = [
    {
      id: 'vlsi-core',
      badge: 'Semiconductor Practice',
      title: 'VLSI Related Services',
      desc: 'Production-grade semiconductor engineering spanning RTL microarchitecture, synthesis, static timing analysis (STA), and FPGA hardware prototyping for mission-critical ASICs.',
      deliverables: [
        'Verilog & SystemVerilog RTL Design',
        'Synopsys DC & Cadence Genus Synthesis',
        'PrimeTime Multi-Corner STA Closure',
        'Xilinx Vivado & Intel Quartus Prototyping'
      ],
      tags: ['SystemVerilog', 'PrimeTime', 'Design Compiler', 'AXI4 / APB'],
      link: 'vlsi-designs.html',
      linkText: 'Explore VLSI Practice'
    },
    {
      id: 'soc-uvm',
      badge: 'SoC Verification',
      title: 'SOC Verification',
      desc: 'Constrained-random testbenches, SystemVerilog assertions (SVA), coverage closure models, and automated regression suites designed for multi-million gate SoC integrity.',
      deliverables: [
        'UVM 1.2 Class-Based Testbench Architecture',
        'SystemVerilog SVA Assertions',
        'Functional & Code Coverage Closure',
        'Automated CI/CD Regression Farms'
      ],
      tags: ['UVM 1.2', 'SystemVerilog', 'SVA Assertions', 'Coverage Closure'],
      link: 'soc-verification.html',
      linkText: 'Explore Verification'
    },
    {
      id: 'embedded-rtos',
      badge: 'Embedded & RTOS',
      title: 'Embedded Systems',
      desc: 'Deterministic bare-metal firmware, FreeRTOS multitasking architectures, peripheral device drivers, and board bring-up across ARM Cortex-M, ESP32, and RISC-V platforms.',
      deliverables: [
        'FreeRTOS Multitasking & Deterministic ISRs',
        'Peripheral Drivers (SPI, I2C, CAN FD, UART)',
        'Low-Power Sleep Modes & Power Management',
        'Secure Bootloader & Encrypted OTA Updates'
      ],
      tags: ['FreeRTOS', 'ARM Cortex-M', 'Embedded C', 'SPI / CAN FD'],
      link: 'embedded-systems.html',
      linkText: 'Explore Embedded'
    },
    {
      id: 'ai-edgeml',
      badge: 'Edge AI & TinyML',
      title: 'AI Models & Edge Inference',
      desc: 'Post-training INT8 quantization, TinyML edge inference engines, and hardware-accelerated computer vision and sensor fusion models engineered for edge microcontrollers and NPUs.',
      deliverables: [
        'INT8 / FP16 Neural Quantization Pipelines',
        'TinyML Inference on ARM Cortex-M / Ethos',
        'FPGA Neural Accelerator Optimization',
        'Real-Time Acoustic & Vibration Anomaly Detect'
      ],
      tags: ['TensorFlow Lite', 'TinyML', 'INT8 Quantization', 'ARM Ethos'],
      link: 'ai-models.html',
      linkText: 'Explore AI Models'
    },
    {
      id: 'tech-marketing',
      badge: 'Technical Marketing',
      title: 'Marketing Solutions',
      desc: 'Specialized technical whitepapers, developer advocacy campaigns, high-intent semiconductor B2B demand generation, and digital marketing strategies tailored for electronics enterprises.',
      deliverables: [
        'Semiconductor Technical Whitepapers',
        'Developer Relations & Engineer Outreach',
        'B2B Technical Pipeline Generation',
        'Product Launches for Electronics Brands'
      ],
      tags: ['DevRel Strategy', 'Technical Whitepapers', 'EDA B2B Funnel', 'Demand Gen'],
      link: 'marketing-solutions.html',
      linkText: 'Explore Marketing'
    },
    {
      id: 'web-engineering',
      badge: 'Web Platforms',
      title: 'Web Development',
      desc: 'Modern, high-speed web applications, cloud-based EDA regression monitoring dashboards, student LMS portals, and high-conversion landing pages engineered for performance.',
      deliverables: [
        'Cloud EDA Job & Telemetry Dashboards',
        'Secure Enterprise Engineering Portals',
        'Sub-Second Global Edge Performance',
        'Custom Interactive Visualizers & Waveform UIs'
      ],
      tags: ['TypeScript', 'Next.js / Node', 'Cloud Architecture', 'Real-Time APIs'],
      link: 'web-development.html',
      linkText: 'Explore Web Dev'
    }
  ];

  let currentIndex = 0;
  let autoPlayTimer = null;
  let isHovered = false;
  let isVisible = true;
  const ROTATE_INTERVAL = 5000; // 5 seconds per slide

  function initShowcase() {
    const showcaseContainer = document.getElementById('servicesShowcase');
    if (!showcaseContainer) return;

    const navButtons = showcaseContainer.querySelectorAll('.service-nav-btn');
    const prevBtn = document.getElementById('showcasePrevBtn');
    const nextBtn = document.getElementById('showcaseNextBtn');
    const stageCard = document.getElementById('servicesStageCard');

    // Attach click events to nav buttons
    navButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (currentIndex === idx) return;
        setService(idx);
        restartTimer();
      });
    });

    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const nextIdx = (currentIndex - 1 + servicesData.length) % servicesData.length;
        setService(nextIdx);
        restartTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = (currentIndex + 1) % servicesData.length;
        setService(nextIdx);
        restartTimer();
      });
    }

    // Hover pauses auto-play
    if (stageCard) {
      stageCard.addEventListener('mouseenter', () => {
        isHovered = true;
        stopTimer();
      });
      stageCard.addEventListener('mouseleave', () => {
        isHovered = false;
        startTimer();
      });
    }

    // Touch swipe support on mobile
    if (stageCard) {
      let touchStartX = 0;
      let touchStartY = 0;

      stageCard.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      stageCard.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            // Swipe left -> Next
            const nextIdx = (currentIndex + 1) % servicesData.length;
            setService(nextIdx);
            restartTimer();
          } else {
            // Swipe right -> Prev
            const nextIdx = (currentIndex - 1 + servicesData.length) % servicesData.length;
            setService(nextIdx);
            restartTimer();
          }
        }
      }, { passive: true });
    }

    const navList = showcaseContainer.querySelector('.services-nav-list');
    if (navList) {
      navList.addEventListener('mouseenter', () => {
        isHovered = true;
        stopTimer();
      });
      navList.addEventListener('mouseleave', () => {
        isHovered = false;
        startTimer();
      });
    }

    // Pause auto-rotation when section is not in viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startTimer();
          } else {
            stopTimer();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(showcaseContainer);
    }

    // Initial render
    renderService(0, false);
    startTimer();
  }

  function setService(index) {
    currentIndex = index;
    renderService(index, true);
  }

  function renderService(index, animate) {
    const data = servicesData[index];
    if (!data) return;

    const showcaseContainer = document.getElementById('servicesShowcase');
    if (!showcaseContainer) return;

    // Update nav buttons & auto-scroll horizontal pill container on mobile WITHOUT scrolling window
    const navButtons = showcaseContainer.querySelectorAll('.service-nav-btn');
    const navList = showcaseContainer.querySelector('.services-nav-list');

    navButtons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        if (window.innerWidth <= 1024 && navList) {
          const btnRect = btn.getBoundingClientRect();
          const listRect = navList.getBoundingClientRect();
          const targetScroll = navList.scrollLeft + (btnRect.left - listRect.left) - (listRect.width / 2) + (btnRect.width / 2);
          navList.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    const wrapper = document.getElementById('stageContentWrapper');
    if (animate && wrapper) {
      wrapper.classList.add('animating');
      setTimeout(() => {
        updateStageElements(data, index);
        wrapper.classList.remove('animating');
      }, 150);
    } else {
      updateStageElements(data, index);
    }
  }

  function updateStageElements(data, index) {
    const badge = document.getElementById('stageBadge');
    const counter = document.getElementById('stageCounter');
    const title = document.getElementById('stageTitle');
    const desc = document.getElementById('stageDesc');
    const deliverables = document.getElementById('stageDeliverables');
    const techTags = document.getElementById('stageTechTags');
    const ctaLink = document.getElementById('stageCtaLink');
    const ctaText = document.getElementById('stageCtaText');

    if (badge) badge.textContent = data.badge;
    if (counter && typeof index === 'number') {
      counter.textContent = `0${index + 1} / 0${servicesData.length}`;
    }
    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;

    // Render Deliverables
    if (deliverables) {
      deliverables.innerHTML = data.deliverables
        .map(
          item => `
        <div class="deliverable-item">
          <i data-lucide="check-circle-2"></i>
          <span>${item}</span>
        </div>
      `
        )
        .join('');
    }

    // Render Tech Tags
    if (techTags) {
      techTags.innerHTML = data.tags
        .map(tag => `<span class="stage-tech-pill">${tag}</span>`)
        .join('');
    }

    // Render CTA
    if (ctaLink) ctaLink.setAttribute('href', data.link);
    if (ctaText) ctaText.textContent = data.linkText;

    // Re-initialize lucide icons inside stage
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function startTimer() {
    stopTimer();
    // On mobile and tablet (<= 1024px), completely disable auto-play rotation.
    // Mobile users browse at their own pace using the horizontal pill bar and touch swipe.
    // This permanently eliminates any background slide jumping or auto-scrolling on mobile.
    if (window.innerWidth <= 1024) return;
    if (isHovered || !isVisible) return;
    autoPlayTimer = setInterval(() => {
      const nextIdx = (currentIndex + 1) % servicesData.length;
      setService(nextIdx);
    }, ROTATE_INTERVAL);
  }

  function stopTimer() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function restartTimer() {
    stopTimer();
    startTimer();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowcase);
  } else {
    initShowcase();
  }
})();
