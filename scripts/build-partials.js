/**
 * ============================================================================
 * BUILD-TIME PARTIAL INJECTION SCRIPT
 * Solves multi-page duplication by injecting canonical partials from
 * frontend/partials/*.html into frontend HTML files at build/dev time.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const PARTIALS_DIR = path.join(FRONTEND_DIR, 'partials');

function loadPartials() {
  const partials = {};
  if (!fs.existsSync(PARTIALS_DIR)) {
    console.error(`Partials directory not found: ${PARTIALS_DIR}`);
    return partials;
  }

  const files = fs.readdirSync(PARTIALS_DIR);
  for (const file of files) {
    if (file.endsWith('.html')) {
      const name = path.basename(file, '.html');
      partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
    }
  }
  return partials;
}

function processHtmlFile(filePath, partials) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [name, partialContent] of Object.entries(partials)) {
    const includePattern = new RegExp(`<!--\\s*@include\\s+${name}\\s*-->`, 'g');
    const blockPattern = new RegExp(`<!--\\s*@partial:${name}-start\\s*-->[\\s\\S]*?<!--\\s*@partial:${name}-end\\s*-->`, 'g');
    const wrappedContent = `<!-- @partial:${name}-start -->\n${partialContent}\n<!-- @partial:${name}-end -->`;

    if (includePattern.test(content)) {
      content = content.replace(includePattern, wrappedContent);
      modified = true;
    } else if (blockPattern.test(content)) {
      content = content.replace(blockPattern, wrappedContent);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function run() {
  console.log('--- Starting Partial Injection ---');
  const partials = loadPartials();
  console.log(`Loaded partials: ${Object.keys(partials).join(', ')}`);

  const pagesToScan = [];

  // Top-level HTML files
  const topFiles = fs.readdirSync(FRONTEND_DIR);
  for (const file of topFiles) {
    if (file.endsWith('.html')) {
      pagesToScan.push(path.join(FRONTEND_DIR, file));
    }
  }

  // pages/*.html
  const pagesDir = path.join(FRONTEND_DIR, 'pages');
  if (fs.existsSync(pagesDir)) {
    const subFiles = fs.readdirSync(pagesDir);
    for (const file of subFiles) {
      if (file.endsWith('.html')) {
        pagesToScan.push(path.join(pagesDir, file));
      }
    }
  }

  let updatedCount = 0;
  for (const p of pagesToScan) {
    if (processHtmlFile(p, partials)) {
      updatedCount++;
      console.log(`[INJECTED] ${path.relative(ROOT_DIR, p)}`);
    }
  }

  console.log(`--- Finished Partial Injection: ${updatedCount} file(s) updated ---`);
}

if (require.main === module) {
  run();
}

module.exports = { run, loadPartials, processHtmlFile };
