const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights/frontend/pages/programs.html'),
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights - Copy/frontend/pages/programs.html')
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // 1. Update .badge-teal to nowrap, height: 24px, flex-shrink: 0, matching styling
  const oldBadgeTealRegex = /\.badge-teal\s*\{[\s\S]*?white-space:\s*normal;[\s\S]*?\}/;
  const newBadgeTeal = `.badge-teal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      min-height: 24px;
      padding: 2px 8px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #047857;
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      border-radius: 4px;
      line-height: 1;
      white-space: nowrap;
      text-align: center;
      box-sizing: border-box;
      flex-shrink: 0;
    }`;
  content = content.replace(oldBadgeTealRegex, newBadgeTeal);

  // 2. Update .badge-price to matching height & flex-shrink
  const oldBadgePriceRegex = /\.badge-price\s*\{[\s\S]*?white-space:\s*nowrap;[\s\S]*?\}/;
  const newBadgePrice = `.badge-price {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      min-height: 24px;
      padding: 2px 8px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #B45309;
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      border-radius: 4px;
      line-height: 1;
      white-space: nowrap;
      box-sizing: border-box;
      flex-shrink: 0;
    }`;
  content = content.replace(oldBadgePriceRegex, newBadgePrice);

  // 3. Update .badge-duration to matching height & flex-shrink
  const oldBadgeDurationRegex = /\.badge-duration\s*\{[\s\S]*?white-space:\s*nowrap;[\s\S]*?\}/;
  const newBadgeDuration = `.badge-duration {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      min-height: 24px;
      padding: 2px 8px;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      color: #475569;
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 4px;
      line-height: 1;
      white-space: nowrap;
      box-sizing: border-box;
      flex-shrink: 0;
    }`;
  content = content.replace(oldBadgeDurationRegex, newBadgeDuration);

  // 4. Update .program-card__header to flex-wrap with gap: 6px
  const oldHeaderRegex = /\.program-card__header\s*\{[\s\S]*?margin-bottom:\s*var\(--space-4\);\s*\}/;
  const newHeader = `.program-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }`;
  content = content.replace(oldHeaderRegex, newHeader);

  // 5. Update template header inner wrapper
  content = content.replace(
    `<div style="display: flex; align-items: center; gap: 6px;">\n                <span class="badge-duration">\${prog.duration}</span>`,
    `<div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">\n                <span class="badge-duration">\${prog.duration}</span>`
  );
  content = content.replace(
    `<div style="display: flex; align-items: center; gap: 6px;">\r\n                <span class="badge-duration">\${prog.duration}</span>`,
    `<div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">\r\n                <span class="badge-duration">\${prog.duration}</span>`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated badges in:', file);
});

