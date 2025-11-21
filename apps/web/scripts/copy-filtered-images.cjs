#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const ttsImagesPath = path.join(process.env.HOME, 'Library/Tabletop Simulator/Mods/Images');
const filteredDataPath = path.join(__dirname, '..', 'filteredData.json');
const outputBasePath = path.join(__dirname, '..', 'public', 'tts-assets');
const reportPath = path.join(__dirname, '..', '..', '..', 'tts-assets-report.json');

console.log('Reading filtered data...');
const filteredData = require(filteredDataPath);

// Store all unique images with metadata
const imageMap = new Map();

// Track images by bag for reporting
const bagReport = {};

// Helper function to extract hash from URL
function getHashFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/([A-F0-9]+)\/?$/i);
  return match ? match[1] : null;
}

// Helper function to categorize based on character/object name and tags
function categorizeObject(bagName, objectName, tags) {
  const name = (bagName || '').toLowerCase();
  const objName = (objectName || '').toLowerCase();
  const tagList = (tags || []).map(t => t.toLowerCase());
  
  // Check tags first for more accurate categorization
  if (tagList.includes('zordcard')) {
    return 'zord';
  }
  
  if (tagList.includes('rangercombatcard')) {
    return 'ranger-deck';
  }
  
  if (tagList.includes('rangercharactercard')) {
    return 'ranger-character';
  }
  
  if (tagList.includes('rangertoken')) {
    return 'ranger-token';
  }
  
  // Enemy categories - use TAGS first, then fallback to names
  // Locations
  if (tagList.includes('locationboard')) {
    return 'enemy-location';
  }
  
  // FootSoldiers
  if (tagList.includes('footsoldiertoken') || tagList.includes('footsoldiercombatcard') ||
      tagList.includes('footsoldierdeploymentcard') || tagList.includes('footsoldierbag')) {
    return 'enemy-footsoldier';
  }
  
  // Nemesis (Psycho Rangers)
  if (tagList.includes('nemesistoken') || tagList.includes('nemesisdeploymentcard')) {
    return 'enemy-nemesis';
  }
  
  // Mastermind
  if (tagList.includes('mastermindtoken') || tagList.includes('mastermindschemecard')) {
    return 'enemy-mastermind';
  }
  
  // Monsters
  if (tagList.includes('monstertoken') || tagList.includes('monsterdeploymentcard')) {
    return 'enemy-monster';
  }
  
  // Bosses
  if (tagList.includes('bosstoken') || tagList.includes('bossdeploymentcard')) {
    return 'enemy-boss';
  }
  
  // Enemy combat cards
  if (tagList.includes('enemycombatcard')) {
    return 'enemy-footsoldier'; // Default enemy combat cards to footsoldier
  }
  
  // Deployment cards (generic)
  if (tagList.includes('deploymentcard')) {
    // Try to infer from bag/object name
    if (name.includes('monster')) return 'enemy-monster';
    if (name.includes('boss')) return 'enemy-boss';
    if (name.includes('mastermind')) return 'enemy-mastermind';
    return 'enemy-footsoldier'; // Default fallback
  }
  
  // Fallback to name-based heuristics
  // Enemy Rangers (Psycho Rangers, Evil Rangers, Ranger Sentries)
  if ((name.includes('psycho') && name.includes('ranger')) || 
      (name.includes('evil') && name.includes('ranger')) ||
      name.includes('ranger sent') || name.includes('ranger slayer')) {
    return 'enemy-boss';
  }
  
  if (name.includes('putty') || name.includes('putties') || 
      name.includes('tronic') || name.includes('tronics') ||
      name.includes('cog') || name.includes('cogs') ||
      name.includes('cyclobot') || name.includes('rinshi') ||
      name.includes('tyrannodrone') || name.includes('krybot')) {
    return 'enemy-footsoldier';
  }
  
  if (name.includes('rita') || name.includes('zedd') || name.includes('divatox') ||
      name.includes('goldar') || name.includes('scorpina') ||
      name.includes('venjix') || name.includes('evox') ||
      name.includes('mesogog') || name.includes('dai shi')) {
    return 'enemy-boss';
  }
  
  if (name.includes('monster') || objName.includes('monster') ||
      name.includes('sphinx') || name.includes('pudgy pig') ||
      name.includes('eye guy') || name.includes('bones') ||
      name.includes('terror toad')) {
    return 'enemy-monster';
  }
  
  // Good Rangers - only after checking for enemy rangers
  if (name.includes('ranger') && !name.includes('zord')) {
    return 'ranger-token'; // Default to ranger-token for misc ranger items
  }
  
  if (name.includes('zord') || name.includes('megazord')) {
    return 'zord';
  }
  
  return 'other';
}

// Helper function to sanitize filenames
function sanitizeFilename(str) {
  return str
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// Determine bag category from its tags
function getBagCategory(bag) {
  if (!bag || !bag.ContainedObjects) return null;
  
  // Check for mastermind scheme cards
  const mastermindCard = bag.ContainedObjects.find(obj => {
    const tags = obj.Tags || [];
    return tags.some(tag => tag.toLowerCase() === 'mastermindschemecard');
  });
  if (mastermindCard) return 'enemy-mastermind';
  
  // Check for deployment cards (footsoldier, monster, boss, nemesis)
  const deploymentCard = bag.ContainedObjects.find(obj => {
    const tags = obj.Tags || [];
    return tags.some(tag => {
      const lower = tag.toLowerCase();
      return lower === 'footsoldierdeploymentcard' || 
             lower === 'monsterdeploymentcard' || 
             lower === 'bossdeploymentcard' || 
             lower === 'nemesisdeploymentcard';
    });
  });
  
  if (deploymentCard) {
    const tags = (deploymentCard.Tags || []).map(t => t.toLowerCase());
    if (tags.includes('footsoldierdeploymentcard')) return 'enemy-footsoldier';
    if (tags.includes('monsterdeploymentcard')) return 'enemy-monster';
    if (tags.includes('bossdeploymentcard')) return 'enemy-boss';
    if (tags.includes('nemesisdeploymentcard')) return 'enemy-nemesis';
  }
  
  return null;
}

// Recursive function to process a bag (including nested bags)
function processBag(bag, parentPath = [], forcedCategory = null) {
  if (!bag) return;
  
  const bagName = bag.Nickname || 'Unknown';
  const fullPath = [...parentPath, bagName].join(' > ');
  
  // Initialize bag report
  if (!bagReport[bagName]) {
    bagReport[bagName] = {
      images: [],
      categories: new Set(),
      found: 0,
      missing: 0
    };
  }
  
  // Determine bag category from deployment card first
  let bagCategory = forcedCategory || getBagCategory(bag);
  
  // Check if this bag contains nested bags
  const nestedBags = bag.ContainedObjects?.filter(obj => obj.Name === 'Bag') || [];
  
  // Process nested bags recursively (pass down the bag category)
  nestedBags.forEach(nestedBag => {
    processBag(nestedBag, [...parentPath, bagName], bagCategory);
  });
  
  // Helper function to process an object (including its states)
  const processObjectImages = (obj, parentName = bagName) => {
    // Determine category: use bag category if available, fall back to object categorization
    const getCategory = () => {
      if (bagCategory) return bagCategory;
      const tags = obj.Tags || [];
      return categorizeObject(bagName, obj.Nickname || parentName, tags);
    };
    
    // Process object's CustomImage (for tokens)
    if (obj.CustomImage && obj.CustomImage.ImageURL) {
        const objectName = obj.Nickname || bagName;
        const category = getCategory();
        const hash = getHashFromUrl(obj.CustomImage.ImageURL);
        
        if (hash) {
          const key = `${hash}-token`;
          if (!imageMap.has(key)) {
            const imageData = {
              hash,
              url: obj.CustomImage.ImageURL,
              bagName,
              objectName,
              category,
              type: 'token'
            };
            imageMap.set(key, imageData);
            bagReport[bagName].images.push(imageData);
            bagReport[bagName].categories.add(category);
          }
      }
    }
    
    // Process object's CustomDeck
    if (obj.CustomDeck) {
      Object.values(obj.CustomDeck).forEach(deck => {
        const objectName = obj.Nickname || parentName;
        const category = getCategory();
          
        // Add FaceURL
        if (deck.FaceURL) {
          const hash = getHashFromUrl(deck.FaceURL);
          if (hash) {
            const key = `${hash}-face`;
            if (!imageMap.has(key)) {
              const imageData = {
                hash,
                url: deck.FaceURL,
                bagName,
                objectName,
                category,
                type: 'face'
              };
              imageMap.set(key, imageData);
              bagReport[bagName].images.push(imageData);
              bagReport[bagName].categories.add(category);
            }
          }
        }
          
        // Add BackURL
        if (deck.BackURL) {
          const hash = getHashFromUrl(deck.BackURL);
          if (hash) {
            const key = `${hash}-back`;
            if (!imageMap.has(key)) {
              const imageData = {
                hash,
                url: deck.BackURL,
                bagName,
                objectName,
                category,
                type: 'back'
              };
              imageMap.set(key, imageData);
              bagReport[bagName].images.push(imageData);
              bagReport[bagName].categories.add(category);
            }
          }
        }
      });
    }
      
    // Process nested contained objects (decks within bags)
    if (obj.ContainedObjects && Array.isArray(obj.ContainedObjects)) {
      obj.ContainedObjects.forEach(nested => {
        if (nested.CustomDeck) {
          Object.values(nested.CustomDeck).forEach(deck => {
            const objectName = nested.Nickname || obj.Nickname || parentName;
            const category = getCategory();
              
            if (deck.FaceURL) {
              const hash = getHashFromUrl(deck.FaceURL);
              if (hash) {
                const key = `${hash}-face`;
                if (!imageMap.has(key)) {
                  const imageData = {
                    hash,
                    url: deck.FaceURL,
                    bagName,
                    objectName,
                    category,
                    type: 'face'
                  };
                  imageMap.set(key, imageData);
                  bagReport[bagName].images.push(imageData);
                  bagReport[bagName].categories.add(category);
                }
              }
            }
              
            if (deck.BackURL) {
              const hash = getHashFromUrl(deck.BackURL);
              if (hash) {
                const key = `${hash}-back`;
                if (!imageMap.has(key)) {
                  const imageData = {
                    hash,
                    url: deck.BackURL,
                    bagName,
                    objectName,
                    category,
                    type: 'back'
                  };
                  imageMap.set(key, imageData);
                  bagReport[bagName].images.push(imageData);
                  bagReport[bagName].categories.add(category);
                }
              }
            }
          });
        }
      });
    }
    
    // Process States (card variants)
    if (obj.States) {
      Object.values(obj.States).forEach(state => {
        processObjectImages(state, obj.Nickname || parentName);
      });
    }
  };
  
  // Process contained objects in the bag (excluding nested bags which were already processed)
  if (bag.ContainedObjects && Array.isArray(bag.ContainedObjects)) {
    bag.ContainedObjects.forEach(obj => {
      // Skip nested bags - they're processed separately
      if (obj.Name === 'Bag') return;
      
      processObjectImages(obj, bagName);
    });
  }
}

// Process all bags and extract images
console.log('Processing bags and extracting image URLs...');
let processedBags = 0;

filteredData.forEach(bagArray => {
  // Each entry can contain multiple bags (e.g., character variants)
  bagArray.forEach(bag => {
    if (!bag) return;
    
    processedBags++;
    processBag(bag);
  });
});

console.log(`Processed ${processedBags} bags`);
console.log(`Found ${imageMap.size} unique images`);

// Get TTS files
console.log('\nScanning TTS Images folder...');
const ttsFiles = fs.readdirSync(ttsImagesPath);
console.log(`Found ${ttsFiles.length} files in TTS folder`);

// Create output directories
const categories = [...new Set([...imageMap.values()].map(img => img.category))];
categories.forEach(category => {
  const categoryPath = path.join(outputBasePath, category);
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
    console.log(`Created directory: ${category}/`);
  }
});

// Copy images
console.log('\nCopying images...');
let copiedCount = 0;
let notFoundCount = 0;
const notFoundImages = [];

const images = [...imageMap.values()];
images.forEach((image, index) => {
  // Find TTS file containing this hash
  const ttsFile = ttsFiles.find(filename => filename.includes(image.hash));
  
  if (ttsFile) {
    const ext = path.extname(ttsFile);
    
    // For sprite sheets (face/back), use only hash. For tokens, include bag/object names
    let outputFilename;
    if (image.type === 'face' || image.type === 'back') {
      // Sprite sheets: just hash-type.ext
      outputFilename = `${image.hash.substring(0, 8)}-${image.type}${ext}`;
    } else {
      // Tokens: bagname-objectname-type-hash.ext
      const safeName = sanitizeFilename(image.bagName);
      const safeObjectName = sanitizeFilename(image.objectName);
      if (safeName === safeObjectName) {
        outputFilename = `${safeName}-${image.type}-${image.hash.substring(0, 8)}${ext}`;
      } else {
        outputFilename = `${safeName}-${safeObjectName}-${image.type}-${image.hash.substring(0, 8)}${ext}`;
      }
    }
    
    const sourcePath = path.join(ttsImagesPath, ttsFile);
    const destPath = path.join(outputBasePath, image.category, outputFilename);
    
    fs.copyFileSync(sourcePath, destPath);
    copiedCount++;
    
    // Update bag report
    image.found = true;
    image.filename = outputFilename;
    bagReport[image.bagName].found++;
    
    if ((index + 1) % 50 === 0 || index === images.length - 1) {
      process.stdout.write(`\r  Progress: ${index + 1}/${images.length} images`);
    }
  } else {
    notFoundCount++;
    notFoundImages.push(image);
    
    // Update bag report
    image.found = false;
    bagReport[image.bagName].missing++;
  }
});

console.log('\n');
console.log('=== SUMMARY ===');
console.log(`Successfully copied: ${copiedCount} images`);
console.log(`Not found in TTS folder: ${notFoundCount} images`);

// Show stats by category
console.log('\n=== BY CATEGORY ===');
const categoryStats = {};
images.forEach(img => {
  if (!categoryStats[img.category]) {
    categoryStats[img.category] = { total: 0, copied: 0 };
  }
  categoryStats[img.category].total++;
  
  const ttsFile = ttsFiles.find(filename => filename.includes(img.hash));
  if (ttsFile) {
    categoryStats[img.category].copied++;
  }
});

Object.entries(categoryStats).forEach(([category, stats]) => {
  console.log(`  ${category}: ${stats.copied}/${stats.total}`);
});

if (notFoundImages.length > 0 && notFoundImages.length <= 20) {
  console.log('\n=== NOT FOUND ===');
  notFoundImages.forEach(img => {
    console.log(`  - ${img.bagName} (${img.objectName}) [${img.category}]`);
    console.log(`    Hash: ${img.hash}`);
  });
} else if (notFoundImages.length > 20) {
  console.log(`\n${notFoundImages.length} images not found. Run TTS loader script to download them.`);
}

// Generate detailed report
console.log('\nGenerating detailed report...');

const report = {
  summary: {
    totalBags: processedBags,
    totalImages: imageMap.size,
    imagesFound: copiedCount,
    imagesMissing: notFoundCount,
    percentageFound: Math.round((copiedCount / imageMap.size) * 100)
  },
  byCategory: categoryStats,
  bags: {}
};

// Convert bag report to final format
Object.entries(bagReport).forEach(([bagName, data]) => {
  report.bags[bagName] = {
    totalImages: data.images.length,
    found: data.found,
    missing: data.missing,
    categories: [...data.categories],
    images: data.images.map(img => ({
      objectName: img.objectName,
      category: img.category,
      type: img.type,
      hash: img.hash,
      found: img.found || false,
      filename: img.filename || null,
      url: img.url
    }))
  };
});

// Write report to JSON
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\nImages copied to: ${outputBasePath}`);
console.log(`Report saved to: ${reportPath}`);

// Show some example missing items
if (notFoundImages.length > 0) {
  console.log('\n=== SAMPLE MISSING IMAGES ===');
  const missingByBag = {};
  notFoundImages.forEach(img => {
    if (!missingByBag[img.bagName]) {
      missingByBag[img.bagName] = [];
    }
    missingByBag[img.bagName].push(img);
  });
  
  Object.entries(missingByBag).slice(0, 5).forEach(([bagName, images]) => {
    console.log(`  ${bagName}: ${images.length} missing`);
    images.slice(0, 2).forEach(img => {
      console.log(`    - ${img.objectName} (${img.type}) [${img.category}]`);
    });
  });
  
  if (Object.keys(missingByBag).length > 5) {
    console.log(`  ... and ${Object.keys(missingByBag).length - 5} more bags with missing images`);
  }
}
