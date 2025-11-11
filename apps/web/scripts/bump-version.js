#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION_FILE = path.join(__dirname, '../public/data/version.json');

// Parse command line arguments
const args = process.argv.slice(2);
const bumpType = args[0] || 'patch'; // major, minor, or patch
const description = args.slice(1).join(' ') || 'Updated data';

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

try {
  // Read current version
  const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  const oldVersion = versionData.version;
  
  // Bump version
  const newVersion = bumpVersion(oldVersion, bumpType);
  
  // Update version data
  versionData.version = newVersion;
  versionData.lastUpdated = new Date().toISOString();
  versionData.description = description;
  
  // Write back to file
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');
  
  console.log(`✅ Version bumped: ${oldVersion} → ${newVersion}`);
  console.log(`📝 Description: ${description}`);
  console.log(`📅 Updated: ${versionData.lastUpdated}`);
  console.log(`\n📄 Updated file: ${VERSION_FILE}`);
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
