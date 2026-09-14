# VLSI Insights - Semiconductor & Embedded Engineering Platform

A modern, high-performance static web platform for **VLSI Insights**, delivering industry-calibrated semiconductor education, EDA software access guides, front-end engineering services, and technical insights.

---

## Directory Architecture

```
VLSI Insights/
├── backend/                             # Backend Scaffolding & Database Schemas
│   ├── database/                        # Database Schemas & Row-Level Security
│   │   └── supabase_rls_security.sql    # Supabase RLS policies and profiles table
│   └── src/                             # Microservice scaffolding (.gitkeep)
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       └── services/
│
├── docs/                                # Developer Specifications & Design References
│   ├── components.md                    # Component inventory & styling specifications
│   ├── content.md                       # Curricula and marketing copywriting outlines
│   ├── design.md                        # Design system tokens, color palettes & motion specs
│   ├── fix-checklist.md                 # Testing and verification punchlists
│   ├── prompt.md                        # Master project prompts & agent directives
│   ├── structure.md                     # Sitemap, routing schema & page blueprints
│   ├── ui-improvements.md               # UI polish and enhancement specifications
│   ├── UI_ELEVATION_CHECKLIST.md        # UI elevation milestone tracking (v1)
│   └── UI_ELEVATION_CHECKLIST_V2.md     # UI elevation milestone tracking (v2)
│
├── backups/                             # Project Archives & Snapshots
│   ├── VLSI-Insights-Website.zip        # Baseline archive snapshot
│   └── VLSI-Insights-Website-v8.zip     # Milestone v8 snapshot
│
├── scratch/                             # Local Preview Tools (.gitignore)
│   └── server.js                        # Lightweight static HTTP server (port 5000)
│
├── netlify.toml                         # Master Netlify build, header caching & routing rules
├── .gitignore                           # Git ignore rules (backups, scratch, logs, credentials)
├── README.md                            # Repository & directory guide (this file)
│
└── frontend/                            # Production Static Website Root
    ├── css/                             # Centralized Stylesheets
    │   ├── navbar.css                   # Master navigation bar & global hero watermark
    │   ├── footer.css                   # Master unified footer system
    │   ├── global.css                   # Global resets, color tokens & utility classes
    │   ├── animated-list.css            # Scale list animations with gradient masks
    │   ├── counter.css                  # Spring-driven rolling digit counters
    │   └── morph-slider.css             # WebGL displacement morph slider
    │
    ├── js/                              # Client-side JavaScript Modules
    │   ├── main.js                      # Navigation drawer, mobile accordions & active links
    │   ├── supabase.js                  # Supabase auth client initialization & session state
    │   ├── profiles.js                  # User profile and metadata management
    │   ├── reactbits-integration.js     # WebGL shaders and animation controller
    │   └── blog-fallback.js             # Offline fallback dataset for blog articles
    │
    ├── images/                          # Visual & Brand Assets
    │   ├── blogs/                       # Technical blog article thumbnails
    │   ├── favicon.ico                  # 32x32 branded site icon
    │   ├── favicon.png                  # High-res branded site icon
    │   └── ...                          # Logos, diagrams, hero sliders, and service imagery
    │
    ├── _redirects                       # Production HTTP 200/301/302 redirects
    ├── favicon.ico                      # Root branded site icon
    ├── favicon.png                      # Root high-res branded site icon
    │
    ├── index.html                       # Homepage & interactive hero slideshow
    ├── 404.html                         # Custom 404 error page
    ├── _redirects                       # Production HTTP 200/301/302 redirects
    ├── favicon.ico                      # Root branded site icon
    ├── favicon.png                      # Root high-res branded site icon
    │
    └── pages/                           # Subpage HTML Files
        ├── login.html                   # Student portal auth with dedicated password reset
        ├── cart.html                    # Course cart, enrollment, promo codes & checkout
        ├── programs.html                # 11 semiconductor training tracks with Guest Cart
        ├── front-end-software.html      # QuestaSim, ModelSim & EDA Playground walkthroughs
        ├── blog.html                    # Dynamic WordPress blog hub with offline fallbacks
        ├── technical-blogs.html         # Pre-rendered technical blog catalog
        ├── post.html                    # Markdown article reader with dynamic routing
        ├── testimonials.html            # Student reviews, collage & video testimonials
        ├── about-company.html           # Corporate story, mission, and facility overview
        ├── about-owner.html             # Founder profile, credentials, and achievements
        ├── complete-profile.html        # Post-registration student onboarding
        ├── auth-callback.html           # OAuth callback handler for Supabase
        │
        ├── vlsi-designs.html            # Service: RTL Microarchitecture & Silicon Eng
        ├── soc-verification.html        # Service: UVM Testbench & SystemVerilog Verif
        ├── embedded-systems.html        # Service: MCU Firmware, RTOS & Device Drivers
        ├── ai-models.html               # Service: Edge AI & Embedded Machine Learning
        ├── web-development.html         # Service: Engineering Web Applications & Portals
        ├── technical-training.html      # Service: Corporate & Academic Training
        ├── marketing-solutions.html     # Service: Strategic Technical B2B Marketing
        │
        ├── about.html                   # Alias redirect -> about-company.html
        ├── contact.html                 # Alias redirect -> index.html#contact
        └── solutions.html               # Alias redirect -> marketing-solutions.html
```

---

## Key Development Guidelines

1. **Global Stylesheets**:
   - Do not duplicate navbar or footer rules inline. Always import `<link rel="stylesheet" href="css/navbar.css">`, `<link rel="stylesheet" href="css/footer.css">`, and `<link rel="stylesheet" href="css/global.css">`.
2. **Hero Watermark**:
   - The circuit watermark SVG is globally styled in `css/navbar.css` (`.hero-circuit-watermark`).
3. **Deployment**:
   - Deployed directly to Netlify from repository root with `base = "frontend"` and `publish = "."`.
   - Clean URLs (e.g. `/programs` serving `/programs.html`) and redirects are managed via `netlify.toml` and `frontend/_redirects`.
