#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This is a Node.js script to update the database
// It needs to be run from the browser context or we need a different approach
// For now, we'll export a function that can be called from the React app

const fs = require('fs');
const path = require('path');

// Read the ranger token images mapping
const mappingPath = path.join(__dirname, '../data/ranger-token-images.json');
const rangerImageMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Export the mapping so it can be used in React
module.exports = rangerImageMapping;

// Note: Since WatermelonDB uses LokiJS in the browser, we need to update the
// database from within the React app. This mapping file is used by a React component.
// See the updateRangerImagesFromTTS function in the AllRangers component.

async function updateRangerImages() {
  try {
    console.log('=== UPDATING RANGER IMAGES ===\n');
    
    const rangersCollection = database.get('rangers');
    const allRangers = await rangersCollection.query().fetch();
    
    let updated = 0;
    let skipped = 0;
    let notFound = 0;
    
    for (const ranger of allRangers) {
      // Try to find matching image by ranger name
      const imageMeta = rangerImageMapping[ranger.name];
      
      if (imageMeta) {
        // Update the ranger with the new image URL
        await database.write(async () => {
          await ranger.update((r) => {
            r.imageUrl = imageMeta.imagePath;
          });
        });
        
        console.log(`✅ ${ranger.name}`);
        console.log(`   → ${imageMeta.imagePath}`);
        updated++;
      } else {
        console.log(`⚠️  ${ranger.name} (no matching image)`);
        notFound++;
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total processed: ${allRangers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating ranger images:', error);
    process.exit(1);
  }
}

// Run the update
updateRangerImages();
