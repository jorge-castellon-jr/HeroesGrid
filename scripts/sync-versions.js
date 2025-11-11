#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read root package.json
const rootPackagePath = path.join(__dirname, '../package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const rootVersion = rootPackage.version;

console.log(`🔄 Syncing version ${rootVersion} to all packages...`);

// Find all package.json files in apps and packages directories
const workspaceDirs = ['apps', 'packages'];
let updatedCount = 0;

workspaceDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const packageJsonPath = path.join(dirPath, item, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.version !== rootVersion) {
        packageJson.version = rootVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`  ✅ Updated ${dir}/${item} to v${rootVersion}`);
        updatedCount++;
      } else {
        console.log(`  ⏭️  ${dir}/${item} already at v${rootVersion}`);
      }
    }
  });
});

if (updatedCount > 0) {
  console.log(`\n✨ Successfully updated ${updatedCount} package(s)`);
} else {
  console.log('\n✨ All packages are already in sync');
}
