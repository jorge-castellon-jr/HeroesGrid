# Share Ranger as Image Feature

## Overview

Add ability to capture custom ranger pages (full ranger or just deck) as images and copy to clipboard for easy sharing. This enables users to share their custom rangers on social media, Discord, or other platforms without manual screenshots.

## Requirements

- Local-first compatible (works offline)
- Supports both light and dark mode rendering
- Clipboard API integration for one-click sharing
- User feedback via toast notifications
- Capture ranger character card OR deck cards

## Implementation Tasks

### Phase 1: Dependencies & Utilities

- [ ] Install `html2canvas` package via yarn
  ```bash
  cd apps/web
  yarn add html2canvas
  ```

- [ ] Create share utility function at `apps/web/src/utils/shareAsImage.js`
  - [ ] Function to convert DOM element to canvas using html2canvas
  - [ ] Function to convert canvas to blob (PNG format)
  - [ ] Function to copy blob to clipboard using Clipboard API
  - [ ] Error handling for unsupported browsers
  - [ ] Add JSDoc comments

### Phase 2: Component Integration

- [ ] Update `CustomRangerDetail.jsx` view mode (line ~702)
  - [ ] Add "Share Full Ranger" button in header actions
  - [ ] Add "Share Deck" button next to "Print Deck" button (line ~775)
  - [ ] Add ref to capture ranger info section
  - [ ] Add ref to capture deck section
  - [ ] Import and integrate share utility
  - [ ] Add loading states during capture
  - [ ] Show success/error toasts using existing `useDialog` hook

### Phase 3: Styling & UX

- [ ] Ensure captured elements have proper styling
  - [ ] Add container with white/dark background for clean capture
  - [ ] Add padding/margins for captured sections
  - [ ] Consider adding watermark or branding (optional)
  
- [ ] Add share icon to buttons (from `lucide-react`)
  - [ ] Use `Share2` icon for consistency

- [ ] Handle responsive layouts
  - [ ] Disable share on very small screens (optional)
  - [ ] Optimize capture size for social media (1200x630 recommended)

### Phase 4: Testing

- [ ] Test in Chrome (primary browser)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test light mode capture
- [ ] Test dark mode capture
- [ ] Test with empty deck (edge case)
- [ ] Test with full deck (10 cards)
- [ ] Test with extra characters
- [ ] Test clipboard permissions
- [ ] Test offline functionality (PWA mode)

### Phase 5: Documentation

- [ ] Update `docs/AI_RULES.md` with share feature patterns
- [ ] Add inline code comments for future maintainability
- [ ] Consider adding user-facing help text/tooltip

## Technical Details

### html2canvas Configuration

```javascript
const options = {
  backgroundColor: null, // Preserve transparency
  scale: 2, // Higher quality (2x pixel ratio)
  useCORS: true, // Handle external images
  logging: false, // Disable debug logs
  windowWidth: 1200, // Consistent width for social sharing
};
```

### Clipboard API Usage

```javascript
// Modern browsers
await navigator.clipboard.write([
  new ClipboardItem({
    'image/png': blob
  })
]);
```

### Fallback Strategy

- Check for Clipboard API support (`navigator.clipboard?.write`)
- If unsupported, show download link as fallback
- Provide clear error messages

## File Locations

- **Utility**: `apps/web/src/utils/shareAsImage.js`
- **Component**: `apps/web/src/pages/CustomRangerDetail.jsx`
- **Dependency**: Add to `apps/web/package.json`

## References

- html2canvas docs: https://html2canvas.hertzen.com/
- Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- PWA image sharing: https://web.dev/image-support-for-async-clipboard/

## Success Criteria

- [ ] User can click "Share Full Ranger" and image is copied to clipboard
- [ ] User can click "Share Deck" and only deck cards are copied to clipboard
- [ ] Toast notification confirms successful copy
- [ ] Works in offline PWA mode
- [ ] Maintains visual quality in both light/dark modes
- [ ] No console errors or warnings
- [ ] Builds successfully with `yarn build`

## Notes

- Consider adding option to share individual cards in future iteration
- Could extend to share custom ranger collections
- Future: Add direct social media sharing buttons (Twitter, Discord, etc.)
- Consider adding "Download as Image" option alongside clipboard copy
