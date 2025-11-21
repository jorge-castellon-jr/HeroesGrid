const fs = require('fs');
const path = require('path');

// Read filtered data
const filteredDataPath = path.join(__dirname, '../filteredData.json');
const filteredData = JSON.parse(fs.readFileSync(filteredDataPath, 'utf-8'));

// Map to store unique sprite sheets
const spriteSheetMap = new Map(); // hash -> { face, back, width, height }
const cardMap = new Map(); // cardID -> { sprite sheets, positions }

function extractCardsRecursive(obj, parentBagName) {
  if (!obj || typeof obj !== 'object') return;

  // Handle arrays
  if (Array.isArray(obj)) {
    obj.forEach(item => extractCardsRecursive(item, parentBagName));
    return;
  }

  // Process cards with CardID
  if (obj.CardID !== undefined && obj.CustomDeck) {
    const cardID = obj.CardID;
    const deckKey = Object.keys(obj.CustomDeck)[0];
    const deck = obj.CustomDeck[deckKey];

    if (!deck.FaceURL) return;

    // Extract hash from URL (last part before trailing slash)
    const faceHash = deck.FaceURL.split('/').filter(Boolean).pop();
    const backHash = deck.BackURL ? deck.BackURL.split('/').filter(Boolean).pop() : null;

    // Store sprite sheet info
    if (!spriteSheetMap.has(faceHash)) {
      spriteSheetMap.set(faceHash, {
        faceHash,
        backHash,
        width: deck.NumWidth,
        height: deck.NumHeight,
        uniqueBack: deck.UniqueBack,
        type: deck.Type,
        faceURL: deck.FaceURL,
        backURL: deck.BackURL
      });
    }

    // Calculate position in grid (cardID mod gridSize)
    const gridSize = deck.NumWidth * deck.NumHeight;
    const position = cardID % gridSize;
    const row = Math.floor(position / deck.NumWidth);
    const col = position % deck.NumWidth;

    // Store card info
    if (!cardMap.has(cardID)) {
      cardMap.set(cardID, {
        cardID,
        cardName: obj.Nickname || 'Unknown',
        bagName: parentBagName,
        spriteSheets: []
      });
    }

    cardMap.get(cardID).spriteSheets.push({
      faceHash,
      backHash,
      width: deck.NumWidth,
      height: deck.NumHeight,
      position,
      row,
      col,
      gridSize
    });
  }

  // Handle DeckIDs (for decks with multiple cards)
  if (obj.DeckIDs && Array.isArray(obj.DeckIDs) && obj.CustomDeck) {
    const deckKey = Object.keys(obj.CustomDeck)[0];
    const deck = obj.CustomDeck[deckKey];

    if (!deck.FaceURL) return;

    const faceHash = deck.FaceURL.split('/').filter(Boolean).pop();
    const backHash = deck.BackURL ? deck.BackURL.split('/').filter(Boolean).pop() : null;

    if (!spriteSheetMap.has(faceHash)) {
      spriteSheetMap.set(faceHash, {
        faceHash,
        backHash,
        width: deck.NumWidth,
        height: deck.NumHeight,
        uniqueBack: deck.UniqueBack,
        type: deck.Type,
        faceURL: deck.FaceURL,
        backURL: deck.BackURL
      });
    }

    // Process each deck ID
    const gridSize = deck.NumWidth * deck.NumHeight;
    obj.DeckIDs.forEach(cardID => {
      const position = cardID % gridSize;
      const row = Math.floor(position / deck.NumWidth);
      const col = position % deck.NumWidth;

      if (!cardMap.has(cardID)) {
        cardMap.set(cardID, {
          cardID,
          cardName: 'Unknown (in deck)',
          bagName: parentBagName,
          spriteSheets: []
        });
      }

      cardMap.get(cardID).spriteSheets.push({
        faceHash,
        backHash,
        width: deck.NumWidth,
        height: deck.NumHeight,
        position,
        row,
        col,
        gridSize
      });
    });
  }

  // Recurse through objects
  for (const [key, value] of Object.entries(obj)) {
    extractCardsRecursive(value, parentBagName || obj.Nickname || 'Unknown');
  }
}

// Process all entries
filteredData.forEach((entry, idx) => {
  if (Array.isArray(entry)) {
    entry.forEach((bag, bagIdx) => {
      const bagName = bag?.Nickname || `Bag ${idx}-${bagIdx}`;
      extractCardsRecursive(bag, bagName);
    });
  } else {
    const bagName = entry?.Nickname || `Bag ${idx}`;
    extractCardsRecursive(entry, bagName);
  }
});

// Generate output
const output = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalSpriteSheets: spriteSheetMap.size,
    totalUniqueCards: cardMap.size
  },
  spriteSheets: Array.from(spriteSheetMap.values()).map(sheet => ({
    faceHash: sheet.faceHash,
    backHash: sheet.backHash,
    dimensions: {
      width: sheet.width,
      height: sheet.height,
      gridSize: sheet.width * sheet.height
    },
    uniqueBack: sheet.uniqueBack,
    type: sheet.type,
    faceURL: sheet.faceURL,
    backURL: sheet.backURL
  })),
  cards: Array.from(cardMap.values())
    .sort((a, b) => a.cardID - b.cardID)
    .map(card => ({
      cardID: card.cardID,
      cardName: card.cardName,
      bagName: card.bagName,
      spriteSheets: card.spriteSheets.map(sheet => ({
        faceHash: sheet.faceHash,
        backHash: sheet.backHash,
        position: sheet.position,
        row: sheet.row,
        col: sheet.col,
        dimensions: {
          width: sheet.width,
          height: sheet.height,
          gridSize: sheet.gridSize
        }
      }))
    }))
};

// Save to file
const outputPath = path.join(__dirname, '../../sprite-sheet-map.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Sprite sheet map generated');
console.log(`   Total sprite sheets: ${output.summary.totalSpriteSheets}`);
console.log(`   Total unique cards: ${output.summary.totalUniqueCards}`);
console.log(`   Output: ${outputPath}`);
