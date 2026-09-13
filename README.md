# VLSI Insights - Semiconductor & Embedded Engineering Platform

A modern, high-performance static web platform for **VLSI Insights**, delivering industry-calibrated semiconductor education, EDA software access guides, front-end engineering services, and technical insights.

---

## Directory Architecture

```
VLSI Insights/
├── docs/                                # Developer Specifications & Design Reference
│   ├── components.md                    # Component inventory & styling specifications
│   ├── content.md                       # Curricula and marketing copywriting outlines
│   ├── design.md                        # Design system tokens, color palettes & motion specs
│   ├── prompt.md                        # Master project prompts & agent directives
│   └── structure.md                     # Sitemap, routing schema & page blueprints
│
├── backups/                             # Project Archives & Snapshots
│   ├── VLSI-Insights-Website.zip        # Baseline archive snapshot
│   └── VLSI-Insights-Website-v2.zip     # Milestone v2 snapshot
│
├── README.md                            # Repository & directory guide (this file)
│
└── Website/                             # Production-Ready Static Website Root
    ├── css/                             # Centralized Stylesheets
    │   ├── navbar.css                   # Master navigation bar & global hero watermark
    │   ├── footer.css                   # Master unified footer system
    │   └── global.css                   # Global resets, color tokens & utility classes
    │
    ├── js/                              # Client-side JavaScript
    │   └── main.js                      # Navigation drawer, accordions, & cart synchronization
    │
    ├── images/                          # Visual & Brand Assets
    │   ├── blogs/                       # Technical blog article thumbnails
    │   └── ...                          # Logos, diagrams, hero sliders, and service imagery
    │
    ├── netlify.toml                     # Netlify build, clean URLs, and routing rules
    ├── _redirects                       # Production HTTP 200/302 redirects
    │
    ├── index.html                       # Homepage & interactive hero slideshow
    ├── 404.html                         # Custom 404 error page
    ├── login.html                       # Student & faculty portal authentication
    ├── cart.html                        # Course cart, enrollment & checkout
    ├── programs.html                    # 11 industry-calibrated semiconductor programs
    ├── front-end-software.html          # QuestaSim, ModelSim & EDA Playground walkthroughs
    ├── blog.html                        # Technical blog hub with category filters
    ├── technical-blogs.html             # Extended blog catalog
    ├── post.html                        # Dynamic Markdown-compatible article reader
    ├── testimonials.html                # Student reviews, collage & video testimonials
    ├── about-company.html               # Corporate story, mission, and facility overview
    ├── about-owner.html                 # Founder profile, credentials, and achievements
    │
    ├── vlsi-designs.html                # Service: RTL Microarchitecture & Silicon Eng
    ├── soc-verification.html            # Service: UVM Testbench & SystemVerilog Verif
    ├── embedded-systems.html            # Service: MCU Firmware, RTOS & Device Drivers
    ├── ai-models.html                   # Service: Edge AI & Embedded Machine Learning
    ├── web-development.html             # Service: Engineering Web Applications & Portals
    ├── technical-training.html          # Service: Corporate & Academic Training
    ├── marketing-solutions.html         # Service: Strategic Technical B2B Marketing
    │
    ├── about.html                       # Alias redirect -> about-company.html
    ├── contact.html                     # Alias redirect -> index.html#contact
    └── solutions.html                   # Alias redirect -> marketing-solutions.html
```

---

## Key Development Guidelines

1. **Global Stylesheets**:
   - Do not duplicate navbar or footer rules inline. Always import `<link rel="stylesheet" href="css/navbar.css">` and `<link rel="stylesheet" href="css/footer.css">`.
2. **Hero Watermark**:
   - The circuit watermark SVG is globally styled in `css/navbar.css` (`.hero-circuit-watermark`) at `opacity: 0.25; position: absolute; inset: 0; pointer-events: none; z-index: 1;`.
3. **Deployment**:
   - Deployed directly to Netlify from `VLSI Insights/Website` with `publish = "."`.
   - Clean URLs (e.g. `/programs` serving `/programs.html`) are managed via `netlify.toml` and `_redirects`.
