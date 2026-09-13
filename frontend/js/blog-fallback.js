/**
 * VLSI Insights - Static Blog Fallback Catalog
 * Used automatically when the WordPress REST API is unreachable, offline, or experiencing network latency.
 */
(function() {
  'use strict';

  window.VLSI_FALLBACK_POSTS = [
    {
      id: 101,
      slug: 'rtl-design-vs-design-verification-vlsi-career',
      title: { rendered: 'RTL Design vs Design Verification: Which VLSI Career Path Is Right for You in 2026?' },
      excerpt: { rendered: 'Compare technical responsibilities, daily workflows, EDA tool requirements, and compensation trajectory between front-end RTL microarchitecture and UVM verification.' },
      content: {
        rendered: `
          <p>The semiconductor and chip design sector is experiencing historic expansion. Driven by artificial intelligence accelerators, high-performance computing, automotive electronics, and 5G/6G communication infrastructure, semiconductor companies are actively competing for top-tier silicon engineering talent.</p>
          <h2>Understanding the Core Responsibilities</h2>
          <p><strong>RTL Design Engineering:</strong> As an RTL designer, you translate algorithmic specifications and hardware architecture into synthesizable Verilog or SystemVerilog descriptions. You are the architect and digital carpenter, ensuring the datapath meets target frequency (PPA: Power, Performance, Area).</p>
          <p><strong>Design Verification (DV):</strong> As a verification engineer, your mandate is to find every potential silicon defect before tape-out. You build constrained-random, coverage-driven testbenches using SystemVerilog and UVM (Universal Verification Methodology), writing assertions (SVA) and functional coverage models.</p>
          <h2>Key Comparison Metrics</h2>
          <ul>
            <li><strong>Tool Stack:</strong> RTL uses Synopsys Design Compiler, Cadence Genus, Vivado. DV uses QuestaSim, VCS, Xcelium, and Verdi.</li>
            <li><strong>Job Availability:</strong> Historically, verification engineering accounts for nearly 65% of front-end engineering positions due to testbench complexity.</li>
            <li><strong>Growth Trajectory:</strong> Both paths lead to Principal Engineer, Chief Architect, and Silicon Leadership roles.</li>
          </ul>
        `
      },
      date: '2026-03-01T10:00:00',
      category: 'Career Guidance',
      read_time: '6 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-1.png' }],
        'wp:term': [[{ id: 1, name: 'Career Guidance', slug: 'career' }]]
      }
    },
    {
      id: 102,
      slug: 'vlsi-career-roadmap-2026',
      title: { rendered: 'VLSI Career Roadmap 2026: Complete Guide to Becoming a Successful Silicon Engineer' },
      excerpt: { rendered: 'A comprehensive step-by-step roadmap for ECE graduates and transitioning engineers to master semiconductor fundamentals, digital logic, and front-end ASIC design.' },
      content: {
        rendered: `
          <p>Breaking into the semiconductor design industry requires clear technical direction and hands-on simulation practice. Here is the verified technical roadmap followed by leading engineering cohorts.</p>
          <h2>Phase 1: Digital Electronics & Boolean Mastery</h2>
          <p>Master combinational logic, sequential state machines (Mealy and Moore FSMs), setup and hold timing constraints, clock domain crossing (CDC), and metastability management.</p>
          <h2>Phase 2: Hardware Description Languages (HDL)</h2>
          <p>Transition from basic Verilog syntax to synthesizable IEEE-1800 SystemVerilog. Build parameterized FIFOs, dual-port RAMs, arbitration logic, and AXI/APB bus interfaces.</p>
          <h2>Phase 3: Industry Verification & EDA Simulation</h2>
          <p>Gain fluency with QuestaSim, ModelSim, and cloud-based EDA Playground. Implement self-checking testbenches and UVM transaction-level modeling.</p>
        `
      },
      date: '2026-02-24T14:30:00',
      category: 'Career Roadmap',
      read_time: '8 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-6.png' }],
        'wp:term': [[{ id: 2, name: 'Career Roadmap', slug: 'roadmap' }]]
      }
    },
    {
      id: 103,
      slug: 'top-50-rtl-design-interview-questions',
      title: { rendered: 'Top 50 RTL Design Interview Questions and Practical Answers for 2026' },
      excerpt: { rendered: 'Master essential digital logic, timing closure, FIFO architectures, static timing analysis (STA), and SystemVerilog questions asked by top silicon teams.' },
      content: {
        rendered: `
          <p>Front-end RTL technical interviews assess not just memorized syntax, but profound intuition for hardware implementation, propagation delays, and timing margins.</p>
          <h2>Sample High-Frequency Interview Questions:</h2>
          <h3>1. How do you resolve setup and hold time violations?</h3>
          <p>Setup violations can be resolved by lowering clock frequency, optimizing combinational logic depth between flip-flops, pipelining, or utilizing faster standard cell libraries. Hold violations are frequency-independent and must be resolved by inserting delay buffers on the data path.</p>
          <h3>2. What is the difference between blocking (=) and non-blocking (<=) assignments?</h3>
          <p>Blocking assignments execute sequentially within the procedural block, suitable for combinational logic. Non-blocking assignments schedule updates in the non-blocking assignment (NBA) queue, modeling concurrent register transfers without race conditions.</p>
          <h3>3. Design an Asynchronous FIFO: Key Considerations</h3>
          <p>Pointers must be converted to Gray code before synchronization across clock domains to ensure only one bit changes per clock cycle, preventing multi-bit CDC race states.</p>
        `
      },
      date: '2026-02-18T09:15:00',
      category: 'Interview Prep',
      read_time: '10 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-7.png' }],
        'wp:term': [[{ id: 3, name: 'Interview Prep', slug: 'interview' }]]
      }
    },
    {
      id: 104,
      slug: 'complete-asic-design-flow-explained',
      title: { rendered: 'Complete ASIC Design Flow Explained: From Specification to Silicon Tape-Out' },
      excerpt: { rendered: 'Detailed walkthrough of the full ASIC lifecycle: architectural specification, RTL design, functional verification, logic synthesis, DFT insertion, and physical layout.' },
      content: {
        rendered: `
          <p>Modern ASICs comprise billions of transistors. Navigating the path from product architecture specification to physical GDSII delivery requires a synchronized EDA methodology.</p>
          <h2>The Front-End to Back-End Flow</h2>
          <ol>
            <li><strong>Architectural Specification:</strong> Defining throughput, interface standards (PCIe, DDR, AXI), and power budgets.</li>
            <li><strong>RTL Microarchitecture:</strong> Developing synthesizable SystemVerilog models.</li>
            <li><strong>Functional Verification:</strong> Reaching 100% code and functional coverage using UVM testbenches.</li>
            <li><strong>Logic Synthesis:</strong> Mapping generic RTL constructs to standard cells from foundry target technology (e.g. TSMC 7nm/5nm/3nm).</li>
            <li><strong>STA & Timing Closure:</strong> Verifying setup, hold, recovery, and removal timing across PVT (process, voltage, temperature) corners.</li>
          </ol>
        `
      },
      date: '2026-02-10T11:00:00',
      category: 'ASIC Flow',
      read_time: '7 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-8.png' }],
        'wp:term': [[{ id: 4, name: 'ASIC Flow', slug: 'asic' }]]
      }
    },
    {
      id: 105,
      slug: 'uvm-verification-methodology-guide',
      title: { rendered: 'SystemVerilog Assertions (SVA) and Functional Coverage in Production UVM' },
      excerpt: { rendered: 'Deep dive into building robust UVM testbenches with constrained random stimulus, concurrent assertions, and covergroups for zero-defect chip signoff.' },
      content: {
        rendered: `
          <p>Functional verification accounts for more than half of the total development cost in contemporary system-on-chip (SoC) engineering. Adopting UVM 1.2 ensures modularity, reusability, and regression automation.</p>
          <h2>Core Components of a UVM Testbench</h2>
          <p>A standardized UVM environment separates sequence generation, driver signal toggling, monitor sampling, and scoreboard comparison. Layering concurrent SystemVerilog assertions (SVA) allows verification teams to trap protocol anomalies immediately at the cycle boundary.</p>
        `
      },
      date: '2026-01-29T16:00:00',
      category: 'Verification',
      read_time: '8 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-5.png' }],
        'wp:term': [[{ id: 5, name: 'Verification', slug: 'verification' }]]
      }
    },
    {
      id: 106,
      slug: 'fpga-vs-asic-architectural-tradeoffs',
      title: { rendered: 'FPGA vs ASIC: Cost Curves, Latency, and Silicon Prototyping Trade-offs' },
      excerpt: { rendered: 'Explore when to deploy AMD Xilinx Artix-7/Spartan FPGAs versus committing to full ASIC masks, NRE tooling budgets, and volume economics.' },
      content: {
        rendered: `
          <p>Choosing between field-programmable gate arrays (FPGAs) and custom application-specific integrated circuits (ASICs) is one of the most critical engineering and economic decisions in hardware product development.</p>
          <h2>Key Decision Points:</h2>
          <ul>
            <li><strong>Non-Recurring Engineering (NRE):</strong> FPGAs require zero mask fees, making them ideal for rapid prototyping and low-volume production (< 10,000 units).</li>
            <li><strong>Unit Cost & Power:</strong> High-volume production (> 100,000 units) strongly favors ASICs where unit manufacturing costs plummet and energy efficiency increases by up to 10x.</li>
            <li><strong>Hardware Emulation:</strong> Leading silicon teams utilize large FPGA arrays to emulate SoC designs running real operating systems prior to fabrication.</li>
          </ul>
        `
      },
      date: '2026-01-20T12:00:00',
      category: 'RTL Design',
      read_time: '5 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-10.png' }],
        'wp:term': [[{ id: 6, name: 'RTL Design', slug: 'rtl' }]]
      }
    },
    {
      id: 107,
      slug: 'embedded-systems-firmware-roadmap',
      title: { rendered: 'Embedded Systems & Bare-Metal Firmware Engineering Guide' },
      excerpt: { rendered: 'Master hardware abstraction layers (HAL), FreeRTOS task scheduling, peripheral drivers (I2C, SPI, UART), and board bring-up on ARM Cortex-M and RISC-V.' },
      content: {
        rendered: `
          <p>Firmware bridges physical silicon transistors with high-level software stacks. A proficient embedded engineer possesses deep understanding of register maps, memory-mapped I/O, interrupt service routines (ISRs), and real-time scheduling guarantees.</p>
        `
      },
      date: '2026-01-14T15:20:00',
      category: 'Embedded Systems',
      read_time: '7 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-2.png' }],
        'wp:term': [[{ id: 7, name: 'Embedded Systems', slug: 'embedded' }]]
      }
    },
    {
      id: 108,
      slug: 'questasim-modelsim-eda-setup-guide',
      title: { rendered: 'QuestaSim & ModelSim Simulation Setup Guide for Digital Verification' },
      excerpt: { rendered: 'Step-by-step walkthrough for configuring Siemens QuestaSim and ModelSim: library compilation, vlog options, vsim debug waveforms, and license environments.' },
      content: {
        rendered: `
          <p>Properly setting up your EDA environment is the essential prerequisite for productive digital simulation. This guide covers project compilation, QuestaSim command-line execution, and interactive waveform debugging.</p>
        `
      },
      date: '2026-01-08T09:00:00',
      category: 'EDA Tools',
      read_time: '6 min read',
      _embedded: {
        'wp:featuredmedia': [{ source_url: 'images/blogs/blog-9.png' }],
        'wp:term': [[{ id: 8, name: 'EDA Tools', slug: 'eda' }]]
      }
    }
  ];

  window.VLSI_FALLBACK_CATEGORIES = [
    { id: 'all', name: 'All Topics' },
    { id: 'career', name: 'Career Guidance' },
    { id: 'roadmap', name: 'Career Roadmap' },
    { id: 'interview', name: 'Interview Prep' },
    { id: 'asic', name: 'ASIC Flow' },
    { id: 'verification', name: 'Verification' },
    { id: 'rtl', name: 'RTL Design' },
    { id: 'embedded', name: 'Embedded Systems' },
    { id: 'eda', name: 'EDA Tools' }
  ];
})();
