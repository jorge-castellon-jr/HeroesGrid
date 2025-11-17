# Print-to-Play Feature

The Print-to-Play feature allows users to print ranger decks on A4 paper for physical gameplay.

## Features

- **A4 Layout**: Optimized for standard A4 paper (210mm × 297mm)
- **9 Cards per Page**: 3×3 grid layout with proper spacing
- **Bleed Marks**: 3mm bleed on all sides with cut lines for precise cutting
- **Multi-Ranger Support**: Print multiple ranger decks in one session
- **Browser-based Printing**: No PDF generation required - uses native browser print

## Usage

### From Ranger Detail Page

1. Navigate to any ranger detail page (e.g., `/mighty-morphin/mighty-morphin-red`)
2. Click the **"Print Deck"** button in the deck section
3. This will open the print-to-play page with that ranger's deck loaded

### Direct URL Access

Visit `/print-to-play` with ranger slugs as query parameters:

```
/print-to-play?rangers=mighty-morphin-red,mighty-morphin-blue
```

Multiple rangers can be comma-separated to print multiple decks at once.

### Print Settings

**Before printing:**
- Review the total number of cards and pages

**When printing:**
1. Click the **"Print Cards"** button
2. In the browser print dialog:
   - Set paper size to **A4**
   - Set margins to **None** or **Minimum**
   - Enable **Background graphics** (to preserve colors)
   - Set scale to **100%** (do not scale to fit)

## Card Specifications

- **Card Size**: 2.5" × 3.5" (standard poker card)
- **With Bleed**: 2.75" × 3.75" (full card including bleed)
- **Bleed Amount**: 0.125" (1/8") on all sides
- **Bleed Color**: Matches the ranger's color
- **Cards per Page**: 9 (3 rows × 3 columns)
- **No Shadow**: Cards are printed without drop shadows

## Cutting Guide

1. Print the pages on A4 paper
2. Use the corner bleed marks (L-shaped) to align your cuts
3. Use the row and column cut marks to guide card separation
4. Cut along the bleed marks to achieve the standard 2.5" × 3.5" card size
5. The colored bleed extends 1/8" beyond the card edge
6. For best results, use a paper trimmer or craft knife with a ruler

## Tips

- Use cardstock paper (200-300gsm) for more durable cards
- Consider using card sleeves for additional protection
- Print on matte paper to reduce glare during gameplay
- Make sure "Background Graphics" is enabled in print settings to preserve card colors

## Technical Details

The print-to-play system:
- Fetches ranger decks from the local WatermelonDB database
- Expands deck quantities (e.g., 2× cards become 2 separate cards)
- Arranges cards in optimal 3×3 grids
- Automatically creates multiple pages when needed
- Uses CSS print media queries for perfect A4 output
