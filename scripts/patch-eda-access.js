const fs = require('fs');
const path = require('path');

const files = [
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights/frontend/pages/front-end-software.html'),
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights - Copy/frontend/pages/front-end-software.html')
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // 1. Update the HTML anchor tag for EDA Playground button
  content = content.replace(
    /<a href="login\.html\?redirect=front-end-software\.html" class="eda-tool-card__btn tool-access-btn" id="btnEdaPlaygroundAccess" onclick="return handleEdaAccess\(event\);" aria-label="[^"]*">[\s\S]*?<\/a>/,
    `<a href="https://edaplayground.com/" target="_blank" rel="noopener noreferrer" class="eda-tool-card__btn tool-access-btn" id="btnEdaPlaygroundAccess" onclick="return handleEdaAccess(event);" aria-label="Launch EDA Playground tool">\n            <span>Launch Tool</span>\n            <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>\n          </a>`
  );

  // 2. Update applyEdaAuthState so it never locks the EDA button
  const oldAuthStateRegex = /if \(edaBtn\) \{[\s\S]*?if \(window\.lucide\) lucide\.createIcons\(\{ els: \[edaBtn\] \}\);\s*\}\s*\}/;
  const newAuthState = `if (edaBtn) {
                  edaBtn.href = 'https://edaplayground.com/';
                  edaBtn.target = '_blank';
                  edaBtn.rel = 'noopener noreferrer';
                  edaBtn.setAttribute('aria-label', 'Launch EDA Playground tool');
                  edaBtn.innerHTML = '<span>Launch Tool</span> <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>';
                  if (window.lucide) lucide.createIcons({ els: [edaBtn] });
                }`;
  content = content.replace(oldAuthStateRegex, newAuthState);

  // 3. Update handleEdaAccess function to directly open edaplayground without sign-in check
  const oldHandleRegex = /function handleEdaAccess\(e\) \{[\s\S]*?window\.open\('https:\/\/edaplayground\.com\/', '_blank', 'noopener,noreferrer'\);[\s\S]*?return false;\s*\}/;
  const newHandle = `function handleEdaAccess(e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      window.open('https://edaplayground.com/', '_blank', 'noopener,noreferrer');
      return false;
    }`;
  content = content.replace(oldHandleRegex, newHandle);

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated EDA access in:', file);
});

