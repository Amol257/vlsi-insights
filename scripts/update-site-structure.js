const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');
const PARTIALS_DIR = path.join(FRONTEND_DIR, 'partials');

// -----------------------------------------------------------------------------
// Tag-Balanced Replacement Engine (Prevents any regex over-matching)
// -----------------------------------------------------------------------------
function replaceBalancedTag(content, startNeedle, replacement) {
  let startIndex = -1;
  if (typeof startNeedle === 'string') {
    startIndex = content.indexOf(startNeedle);
  } else if (startNeedle instanceof RegExp) {
    const match = content.match(startNeedle);
    if (match) startIndex = match.index;
  }
  if (startIndex === -1) return content;

  let depth = 0;
  let i = startIndex;

  while (i < content.length) {
    if (content.substr(i, 4).toLowerCase() === '<div') {
      depth++;
      i += 4;
    } else if (content.substr(i, 6).toLowerCase() === '</div>') {
      depth--;
      i += 6;
      if (depth === 0) {
        return content.substring(0, startIndex) + replacement + content.substring(i);
      }
    } else {
      i++;
    }
  }
  return content;
}

// -----------------------------------------------------------------------------
// Content Generators
// -----------------------------------------------------------------------------
function getDesktopDropdownHtml(prefix) {
  const p = prefix || '';
  return `<div class="dropdown-panel dropdown-panel--services" role="menu">
            <div class="dropdown-col">
              <span class="dropdown-col-heading">Engineering Services</span>
              <a href="${p}ai-models.html" class="dropdown-item" role="menuitem">
                <span class="dropdown-item__icon"><i data-lucide="brain"></i></span>
                <div>
                  <div class="dropdown-item__title">AI Models &amp; ML</div>
                  <div class="dropdown-item__desc">Edge AI acceleration and neural architectures.</div>
                </div>
              </a>
              <a href="${p}web-development.html" class="dropdown-item" role="menuitem">
                <span class="dropdown-item__icon"><i data-lucide="code-2"></i></span>
                <div>
                  <div class="dropdown-item__title">Web Development</div>
                  <div class="dropdown-item__desc">Scalable portals and enterprise engineering.</div>
                </div>
              </a>
            </div>

            <div class="dropdown-col">
              <span class="dropdown-col-heading">Training &amp; Growth</span>
              <a href="${p}technical-training.html" class="dropdown-item dropdown-item--has-sub" role="menuitem">
                <span class="dropdown-item__icon"><i data-lucide="graduation-cap"></i></span>
                <div>
                  <div class="dropdown-item__title">Technical Training</div>
                  <div class="dropdown-item__desc">Hands-on VLSI &amp; embedded engineering cohorts.</div>
                </div>
              </a>
              <div class="dropdown-sub-items" role="group" aria-label="Technical Training Specializations">
                <a href="${p}vlsi-designs.html" class="dropdown-sub-item" role="menuitem">
                  <span class="dropdown-sub-item__icon"><i data-lucide="cpu"></i></span>
                  <div class="dropdown-sub-item__content">
                    <div class="dropdown-sub-item__title">VLSI Related Services</div>
                    <div class="dropdown-sub-item__desc">RTL layout, physical design, and verification.</div>
                  </div>
                </a>
                <a href="${p}soc-verification.html" class="dropdown-sub-item" role="menuitem">
                  <span class="dropdown-sub-item__icon"><i data-lucide="shield-check"></i></span>
                  <div class="dropdown-sub-item__content">
                    <div class="dropdown-sub-item__title">SOC Verification</div>
                    <div class="dropdown-sub-item__desc">UVM functional verification architectures.</div>
                  </div>
                </a>
                <a href="${p}embedded-systems.html" class="dropdown-sub-item" role="menuitem">
                  <span class="dropdown-sub-item__icon"><i data-lucide="microchip"></i></span>
                  <div class="dropdown-sub-item__content">
                    <div class="dropdown-sub-item__title">Embedded Systems</div>
                    <div class="dropdown-sub-item__desc">MCU firmware to real-time operating systems.</div>
                  </div>
                </a>
              </div>
              <a href="${p}marketing-solutions.html" class="dropdown-item" role="menuitem">
                <span class="dropdown-item__icon"><i data-lucide="trending-up"></i></span>
                <div>
                  <div class="dropdown-item__title">Marketing Solutions</div>
                  <div class="dropdown-item__desc">Technical brand growth and digital reach.</div>
                </div>
              </a>
            </div>
          </div>`;
}

function getMobileServicesAccordionHtml(prefix) {
  const p = prefix || '';
  return `<div class="mobile-accordion" id="mobileServicesAccordion">
            <div class="mobile-drawer-category-label">Engineering Services</div>
            <a href="${p}ai-models.html" class="drawer-close-trigger"><i data-lucide="brain"></i> AI Models &amp; ML</a>
            <a href="${p}web-development.html" class="drawer-close-trigger"><i data-lucide="code-2"></i> Web Development</a>
            <div class="mobile-drawer-category-label--sub">Training &amp; Growth</div>
            <div class="mobile-nested-group">
              <div class="mobile-nested-header">
                <a href="${p}technical-training.html" class="drawer-close-trigger"><i data-lucide="graduation-cap"></i> Technical Training</a>
                <button type="button" class="mobile-nested-toggle" id="mobileTechTrainingToggle" aria-expanded="false" aria-label="Toggle Technical Training Sub-items">
                  <i data-lucide="chevron-down"></i>
                </button>
              </div>
              <div class="mobile-nested-accordion" id="mobileTechTrainingAccordion">
                <a href="${p}vlsi-designs.html" class="drawer-close-trigger mobile-sub-nested"><i data-lucide="cpu"></i> VLSI Related Services</a>
                <a href="${p}soc-verification.html" class="drawer-close-trigger mobile-sub-nested"><i data-lucide="shield-check"></i> SOC Verification</a>
                <a href="${p}embedded-systems.html" class="drawer-close-trigger mobile-sub-nested"><i data-lucide="microchip"></i> Embedded Systems</a>
              </div>
            </div>
            <a href="${p}marketing-solutions.html" class="drawer-close-trigger"><i data-lucide="trending-up"></i> Marketing Solutions</a>
          </div>`;
}

function getFooterCol2Html(prefix) {
  const p = prefix || '';
  return `<!-- Col 2: Services & Programs (Restructured) -->
        <div>
          <h4 class="footer-col-title">Services</h4>
          <ul class="footer-links">
            <li><a href="${p}ai-models.html" class="footer-link">AI Models &amp; ML</a></li>
            <li><a href="${p}web-development.html" class="footer-link">Web Development</a></li>
            <li style="margin-top: 6px;"><a href="${p}technical-training.html" class="footer-link" style="font-weight: 600; color: var(--trace);">Technical Training</a></li>
            <li style="padding-left: 10px;"><a href="${p}vlsi-designs.html" class="footer-link">&bull; VLSI Related Services</a></li>
            <li style="padding-left: 10px;"><a href="${p}soc-verification.html" class="footer-link">&bull; SOC Verification</a></li>
            <li style="padding-left: 10px;"><a href="${p}embedded-systems.html" class="footer-link">&bull; Embedded Systems</a></li>
            <li style="margin-top: 6px;"><a href="${p}marketing-solutions.html" class="footer-link">Marketing Solutions</a></li>
          </ul>
        </div>`;
}

function getFooterCol4Html(prefix) {
  const p = prefix || '';
  return `<!-- Col 4: Contact & Legal -->
        <div>
          <h4 class="footer-col-title">Contact &amp; Legal</h4>
          <ul class="footer-links footer-brand-margin">
            <li><a href="mailto:info@vlsiinsights.com" class="footer-link">info@vlsiinsights.com</a></li>
            <li><a href="tel:+919810191592" class="footer-link">+91 98101 91592</a></li>
            <li><a href="${p}privacy-policy.html" class="footer-link">Privacy Policy</a></li>
            <li><a href="${p}terms.html" class="footer-link">Terms &amp; Conditions</a></li>
            <li><a href="${p}refund-policy.html" class="footer-link">Refund Policy</a></li>
          </ul>
          <a href="https://wa.me/919810191592?text=Hello%2C%20I%20want%20to%20enquire%20about%20the%20Job%20Oriented%20Program."
            class="whatsapp-cta" target="_blank" rel="noopener noreferrer">
            <i data-lucide="message-circle"></i>
            Chat on WhatsApp
          </a>
        </div>`;
}

function getFooterBottomHtml(prefix) {
  const p = prefix || '';
  return `<div class="footer-bottom">
        <div>&copy; 2026 VLSI Insights. All rights reserved. Registered under DPDP Act 2023 &amp; IT Act 2000.</div>
        <div class="footer-bottom-links">
          <a href="${p}privacy-policy.html" class="footer-link">Privacy Policy</a>
          <a href="${p}terms.html" class="footer-link">Terms &amp; Conditions</a>
          <a href="${p}refund-policy.html" class="footer-link">Refund Policy</a>
          <a href="javascript:void(0)" onclick="if(window.openCookieSettings)window.openCookieSettings();" class="footer-link">Cookie Preferences</a>
          <span>Built for semiconductor excellence.</span>
        </div>
      </div>
      <p class="footer-disclaimer" style="font-size: 0.75rem; color: var(--text-lo); margin-top: 14px; line-height: 1.5; border-top: 1px solid var(--edge); padding-top: 10px;">
        Disclaimer: QuestaSim, ModelSim, VCS, Vivado, and other tool marks are registered trademarks of their respective owners (Siemens EDA, Synopsys, Cadence, AMD Xilinx). VLSI Insights provides educational mentorship and verification engineering services.
      </p>
    </div>
  </footer>`;
}

const COOKIE_BANNER_HTML = `  <!-- Cookie Consent Banner -->
  <div class="cookie-banner" id="cookieConsentBanner" hidden>
    <div class="cookie-banner__text">
      We use cookies to keep your session secure and make the site work smoothly. You can choose to accept all cookies or just the essential ones. Review our <a href="privacy-policy.html" style="color:var(--trace);text-decoration:underline;">Privacy Policy</a> and <a href="terms.html" style="color:var(--trace);text-decoration:underline;">Terms</a>.
    </div>
    <div class="cookie-banner__actions">
      <button type="button" class="cookie-btn--accept" id="cookieAcceptBtn">Accept All</button>
      <button type="button" class="cookie-btn--decline" id="cookieDeclineBtn">Essential Only</button>
    </div>
  </div>\n`;

// -----------------------------------------------------------------------------
// Update a Single HTML File Safely
// -----------------------------------------------------------------------------
function updateFile(filePath, isRoot) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const relName = path.relative(ROOT_DIR, filePath);

  // 1. Desktop dropdown (Tag balanced)
  if (content.includes('dropdown-panel--services')) {
    content = replaceBalancedTag(content, '<div class="dropdown-panel dropdown-panel--services"', getDesktopDropdownHtml(''));
  }

  // 2. Mobile accordion (Tag balanced)
  if (content.includes('id="mobileServicesAccordion"')) {
    content = replaceBalancedTag(content, '<div class="mobile-accordion" id="mobileServicesAccordion"', getMobileServicesAccordionHtml(''));
  }

  // 3. Footer Col 2 (Services)
  const col2NeedleRegex = /(?:<!--\s*Col 2[^>]*-->\s*)?<div>\s*<h4 class="footer-col-title">Services<\/h4>/i;
  if (col2NeedleRegex.test(content)) {
    content = replaceBalancedTag(content, col2NeedleRegex, getFooterCol2Html(''));
  }

  // 4. Footer Col 4 (Contact & Legal)
  const col4NeedleRegex = /(?:<!--\s*Col 4[^>]*-->\s*)?<div>\s*<(?:h4|div) class="footer-col-title">(?:Get in touch|Contact &amp; Support|Contact & Support|Contact|Direct Inquiries)<\/(?:h4|div)>/i;
  if (col4NeedleRegex.test(content)) {
    content = replaceBalancedTag(content, col4NeedleRegex, getFooterCol4Html(''));
  }

  // 5. Footer Bottom
  const bottomNeedleRegex = /<div class="footer-bottom"[\s\S]*?<\/footer>/i;
  if (bottomNeedleRegex.test(content)) {
    content = content.replace(bottomNeedleRegex, getFooterBottomHtml(''));
  }


  // 7. Cookie Consent Banner: add before </body> if missing
  if (!content.includes('cookieConsentBanner') && /<\/body>/i.test(content)) {
    content = content.replace(/<\/body>/i, COOKIE_BANNER_HTML + '</body>');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Safely updated: ${relName} (Length: ${content.length})`);
    return true;
  } else {
    console.log(`ℹ️  No changes: ${relName}`);
    return false;
  }
}

// -----------------------------------------------------------------------------
// Run updates across files
// -----------------------------------------------------------------------------
const allFiles = [
  { path: path.join(FRONTEND_DIR, 'index.html'), isRoot: true },
  { path: path.join(FRONTEND_DIR, '404.html'), isRoot: true },
  ...fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html')).map(f => ({
    path: path.join(PAGES_DIR, f),
    isRoot: false
  }))
];

let updatedCount = 0;
allFiles.forEach(({ path: p, isRoot }) => {
  if (updateFile(p, isRoot)) updatedCount++;
});

// Update partials
// footer.html
const partialFooterPath = path.join(PARTIALS_DIR, 'footer.html');
let partialFooter = fs.readFileSync(partialFooterPath, 'utf8');
const col2Regex = /(?:<!--\s*Col 2[^>]*-->\s*)?<div>\s*<h4 class="footer-col-title">Services<\/h4>/i;
if (col2Regex.test(partialFooter)) {
  partialFooter = replaceBalancedTag(partialFooter, col2Regex, getFooterCol2Html('/'));
}
const col4Regex = /(?:<!--\s*Col 4[^>]*-->\s*)?<div>\s*<(?:h4|div) class="footer-col-title">(?:Get in touch|Contact &amp; Support|Contact & Support|Contact|Contact &amp; Legal)<\/(?:h4|div)>/i;
if (col4Regex.test(partialFooter)) {
  partialFooter = replaceBalancedTag(partialFooter, col4Regex, getFooterCol4Html('/'));
}
const bottomRegex = /<div class="footer-bottom"[\s\S]*?<\/footer>/i;
if (bottomRegex.test(partialFooter)) {
  partialFooter = partialFooter.replace(bottomRegex, getFooterBottomHtml('/'));
}
fs.writeFileSync(partialFooterPath, partialFooter, 'utf8');
console.log(`✅ Safely updated partial: frontend/partials/footer.html`);

// header-nav.html
const partialHeaderPath = path.join(PARTIALS_DIR, 'header-nav.html');
let partialHeader = fs.readFileSync(partialHeaderPath, 'utf8');
if (partialHeader.includes('dropdown-panel--services')) {
  partialHeader = replaceBalancedTag(partialHeader, '<div class="dropdown-panel dropdown-panel--services"', getDesktopDropdownHtml('/'));
}
if (partialHeader.includes('id="mobileServicesAccordion"')) {
  partialHeader = replaceBalancedTag(partialHeader, '<div class="mobile-accordion" id="mobileServicesAccordion"', getMobileServicesAccordionHtml('/'));
}
fs.writeFileSync(partialHeaderPath, partialHeader, 'utf8');
console.log(`✅ Safely updated partial: frontend/partials/header-nav.html`);

console.log(`\nAll files safely updated! Total: ${updatedCount}`);
