#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the sprite sheet map to get card info
const spriteSheetMapPath = path.join(__dirname, '../../../apps/sprite-sheet-map.json');
const spriteSheetMap = JSON.parse(fs.readFileSync(spriteSheetMapPath, 'utf-8'));

// Read the TTS assets report to understand the structure
const reportPath = path.join(__dirname, '../../../tts-assets-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Find all ranger tokens
const rangerTokens = report.bags;

// Create mapping from ranger name pattern to image filename
const rangerImageMapping = {};

// Get all files in the ranger-token directory
const tokenDir = path.join(__dirname, '../public/tts-assets/ranger-token');
const tokenFiles = fs.readdirSync(tokenDir).filter(f => f.endsWith('.png'));

console.log('=== RANGER TOKEN IMAGE MAPPING ===\n');
console.log(`Found ${tokenFiles.length} token image files\n`);

// Create a helper to sanitize names for matching
function sanitize(str) {
  return str.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// For each ranger bag in the report, try to find its token image
Object.entries(rangerTokens).forEach(([bagName, bagData]) => {
  if (!bagData.images || bagData.images.length === 0) return;
  
  // Find token images in this bag
  const tokenImages = bagData.images.filter(img => img.type === 'token' && img.category === 'ranger-token');
  
  if (tokenImages.length > 0) {
    const tokenImage = tokenImages[0];
    const imageFilename = tokenImage.filename;
    
    if (imageFilename) {
      // Try to extract the slug from the bag name
      // Format is typically: "Mighty Morphin Red (Jason Lee Scott)" or similar
      const slugPattern = sanitize(bagName);
      
      rangerImageMapping[bagName] = {
        imagePath: `/tts-assets/ranger-token/${imageFilename}`,
        filename: imageFilename,
        hash: tokenImage.hash
      };
      
      console.log(`${bagName}`);
      console.log(`  → ${imageFilename}\n`);
    }
  }
});

// Save the mapping directly to public folder
const outputPath = path.join(__dirname, '../public/ranger-token-images.json');
fs.writeFileSync(outputPath, JSON.stringify(rangerImageMapping, null, 2));

console.log(`\n✅ Mapping saved to: ${outputPath}`);
console.log(`Total rangers mapped: ${Object.keys(rangerImageMapping).length}`);
