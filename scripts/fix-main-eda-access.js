const fs = require('fs');
const path = require('path');

const files = [
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights/frontend/js/main.js'),
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights - Copy/frontend/js/main.js')
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // Replace lines 357-385
  const oldRegex = /\/\/ 6\.b In-page Auth Prompt Banner & EDA Tool Button \(front-end-software\.html\)[\s\S]*?if \(isValidUser\) \{[\s\S]*?if \(authBanner\) \{[\s\S]*?\}[\s\S]*?if \(edaBtn\) \{[\s\S]*?\}[\s\S]*?\} else \{[\s\S]*?if \(authBanner\) \{[\s\S]*?\}[\s\S]*?if \(edaBtn\) \{[\s\S]*?\}[\s\S]*?\}/;

  const replacement = `// 6.b In-page Auth Prompt Banner & EDA Tool Button (front-end-software.html)
      const authBanner = document.getElementById('authPromptBanner');
      const edaBtn     = document.getElementById('btnEdaPlaygroundAccess');
      if (isValidUser) {
        if (authBanner) {
          authBanner.hidden = true;
          authBanner.style.setProperty('display', 'none', 'important');
        }
      } else {
        if (authBanner) {
          authBanner.hidden = false;
          authBanner.style.removeProperty('display');
        }
      }
      if (edaBtn) {
        edaBtn.href = 'https://edaplayground.com/';
        edaBtn.target = '_blank';
        edaBtn.rel = 'noopener noreferrer';
        edaBtn.setAttribute('aria-label', 'Launch EDA Playground tool');
        edaBtn.innerHTML = '<span>Launch Tool</span> <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>';
        if (window.lucide) lucide.createIcons({ els: [edaBtn] });
      }`;

  if (oldRegex.test(content)) {
    content = content.replace(oldRegex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated main.js in:', file);
  } else {
    console.log('Regex did not match in:', file);
  }
});

