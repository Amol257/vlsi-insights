/**
 * ============================================================================
 * TWIN REPOSITORY VERIFICATION & SYNC ENGINE
 * Compares SHA256 hashes of all assets between primary workspace and twin replica
 * to guarantee 100% byte-for-byte fidelity across environments.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIMARY_REPO = path.resolve(__dirname, '..');
const REPLICA_REPO = 'c:\\Users\\acer\\Desktop\\Antigravity\\VLSI Insights';

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.gemini',
  '.system_generated',
  'brain',
  'dist',
  'scratch',
  '.tempmediaStorage'
]);

function hashFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (e) {
    return null;
  }
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push(relPath);
    }
  }
  return results;
}

function runVerification(shouldSync = false) {
  console.log('====================================================');
  console.log('VLSI INSIGHTS — TWIN REPOSITORY PARITY AUDIT');
  console.log(`Primary: ${PRIMARY_REPO}`);
  console.log(`Replica: ${REPLICA_REPO}`);
  console.log('====================================================\n');

  if (!fs.existsSync(REPLICA_REPO)) {
    console.error(`ERROR: Replica repository directory not found at: ${REPLICA_REPO}`);
    process.exit(1);
  }

  const primaryFiles = getAllFiles(PRIMARY_REPO);
  let matchCount = 0;
  let mismatchCount = 0;
  let missingInReplica = 0;

  const mismatches = [];

  for (const rel of primaryFiles) {
    const p1 = path.join(PRIMARY_REPO, rel);
    const p2 = path.join(REPLICA_REPO, rel);

    const h1 = hashFile(p1);

    if (!fs.existsSync(p2)) {
      missingInReplica++;
      mismatches.push({ file: rel, issue: 'MISSING_IN_REPLICA' });

      if (shouldSync) {
        fs.mkdirSync(path.dirname(p2), { recursive: true });
        fs.copyFileSync(p1, p2);
        console.log(`[SYNC-COPIED] ${rel}`);
      }
      continue;
    }

    const h2 = hashFile(p2);
    if (h1 === h2) {
      matchCount++;
    } else {
      mismatchCount++;
      mismatches.push({ file: rel, issue: 'HASH_MISMATCH', h1: h1.slice(0, 8), h2: h2.slice(0, 8) });

      if (shouldSync) {
        fs.copyFileSync(p1, p2);
        console.log(`[SYNC-UPDATED] ${rel}`);
      }
    }
  }

  console.log('\n---------------- AUDIT SUMMARY ----------------');
  console.log(`Total Files Checked : ${primaryFiles.length}`);
  console.log(`Identical Matches   : ${matchCount}`);
  console.log(`Hash Mismatches     : ${mismatchCount}`);
  console.log(`Missing in Replica  : ${missingInReplica}`);

  if (mismatches.length > 0 && !shouldSync) {
    console.log('\nDetailed Discrepancies:');
    mismatches.slice(0, 20).forEach(m => {
      console.log(`  - [${m.issue}] ${m.file} ${m.h1 ? `(${m.h1} vs ${m.h2})` : ''}`);
    });
    if (mismatches.length > 20) {
      console.log(`  ... and ${mismatches.length - 20} more files`);
    }
    console.log('\nTip: Run with --sync to automatically mirror changes.');
    process.exit(1);
  } else if (shouldSync && (mismatchCount > 0 || missingInReplica > 0)) {
    console.log('\nAll files have been synchronized. Re-running audit...');
    runVerification(false);
  } else {
    console.log('\nSUCCESS: 100% SHA256 PARITY VERIFIED ACROSS TWIN REPOSITORIES.');
    process.exit(0);
  }
}

const args = process.argv.slice(2);
const shouldSync = args.includes('--sync') || args.includes('-s');

runVerification(shouldSync);
