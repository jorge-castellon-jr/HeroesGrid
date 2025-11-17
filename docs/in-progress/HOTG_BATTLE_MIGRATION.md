# HOTG Battle App Migration Plan

> **Note**: Mark each task as `[x]` when completed AND tested to ensure functionality matches the original.

## Overview

Migrate the Heroes of the Grid battle phase simulator from the `hotg-battle` React Native app to the HeroesGrid web app as a new route. The simulator replicates manual battle actions with animations and styling.

### Source Repository
- **Path**: `/Users/jorgecastellonjr./Dev/personal/hotg-battle`
- **Type**: React Native + Next.js monorepo
- **Key Tech**: Tamagui, react-native-reanimated, Zustand

### Target Repository
- **Path**: `/Users/jorgecastellonjr./Dev/personal/HeroesGrid/apps/web`
- **Type**: Vite + React app
- **Key Tech**: Radix UI, Tailwind CSS, React Router

---

## Phase 1: Convert in hotg-battle Repo

Convert React Native components to web-compatible versions, test in the existing Next.js app before migration.

### Setup Tasks

- [ ] Create new branch `feat/web-battle-conversion` in hotg-battle repo
- [ ] Install framer-motion for animations: `yarn add framer-motion`
- [ ] Document current animation behaviors for reference

### Core Component Conversions

#### Animation System
- [ ] Replace `react-native-reanimated` with `framer-motion`
  - Convert `SharedValue` → `useMotionValue`
  - Convert `withSpring` → `spring` transition
  - Convert `withTiming` → `tween` transition
  - Convert `withSequence` → animation sequence arrays
- [ ] Update `useDiceRoll.ts` hook for web animations
- [ ] Convert `DiceRoll.tsx` animations
- [ ] Convert `DiceGrid.tsx` animations
- [ ] Test dice rolling with same visual feel

#### UI Component Replacements
- [ ] Create conversion mapping for Tamagui → Radix UI + Tailwind
  - `YStack` → `<div className="flex flex-col">`
  - `XStack` → `<div className="flex flex-row">`
  - `Stack` → `<div className="relative">`
  - `Text` → `<p>` or `<span>` with Tailwind
  - `Button` → Radix UI Button or Tailwind button
- [ ] Convert `BattleOverlay.tsx`
- [ ] Convert `AttackSequence.tsx`
- [ ] Convert `RangerBattleSequence.tsx`
- [ ] Convert `EnemyBattleSequence.tsx`
- [ ] Convert `DiceControls.tsx`

#### Battle UI Components
- [ ] Convert `UiOverlay.tsx`
- [ ] Convert `RangerInfoUI.tsx`
- [ ] Convert `RangerOptionsUI.tsx`
- [ ] Convert `RangerDeckOptionsUI.tsx`
- [ ] Convert `EnemyOptionsUI.tsx`
- [ ] Convert `SettingsUI.tsx`
- [ ] Convert `SettingsSheet.tsx`
- [ ] Convert `SheetFooter.tsx`

#### Setup Components
- [ ] Convert `RangerSelector.tsx`
- [ ] Convert `EnemySelector.tsx`
- [ ] Convert `MonsterSelector.tsx`
- [ ] Convert `RangerSheetCard.tsx`
- [ ] Convert setup screen

#### Dice Components
- [ ] Convert `DiceFace.tsx`
- [ ] Convert `DiceSvg.tsx`
- [ ] Update dice utilities for web

### Testing in hotg-battle

- [ ] Test dice rolling animation smoothness
- [ ] Test attack sequences
- [ ] Test ranger battle flow
- [ ] Test enemy battle flow
- [ ] Test UI overlays and sheets
- [ ] Test setup/character selection
- [ ] Verify game state management
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)

---

## Phase 2: Migrate to HeroesGrid

Move tested and converted components to the HeroesGrid web app.

### Setup Tasks

- [ ] Create battle feature directory: `apps/web/src/features/battle`
- [ ] Install framer-motion: `yarn add framer-motion`
- [ ] Copy type definitions from hotg-battle
- [ ] Set up routing structure

### File Migration

#### Copy Core Battle Logic
- [ ] Copy battle state management (stores/hooks)
- [ ] Copy game types and interfaces
- [ ] Copy battle utility functions
- [ ] Copy dice logic and types

#### Copy Converted Components

**Battle Components**
- [ ] Copy `BattleOverlay.tsx`
- [ ] Copy `AttackSequence.tsx`
- [ ] Copy `RangerBattleSequence.tsx`
- [ ] Copy `EnemyBattleSequence.tsx`
- [ ] Copy `DiceControls.tsx`

**Dice Components**
- [ ] Copy `DiceRoll.tsx`
- [ ] Copy `DiceGrid.tsx`
- [ ] Copy `DiceFace.tsx`
- [ ] Copy `DiceSvg.tsx`
- [ ] Copy `useDiceRoll.ts`

**UI Components**
- [ ] Copy `UiOverlay.tsx`
- [ ] Copy `RangerInfoUI.tsx`
- [ ] Copy `RangerOptionsUI.tsx`
- [ ] Copy `RangerDeckOptionsUI.tsx`
- [ ] Copy `EnemyOptionsUI.tsx`
- [ ] Copy `SettingsUI.tsx`
- [ ] Copy `SettingsSheet.tsx`
- [ ] Copy `SheetFooter.tsx`

**Setup Components**
- [ ] Copy `RangerSelector.tsx`
- [ ] Copy `EnemySelector.tsx`
- [ ] Copy `MonsterSelector.tsx`
- [ ] Copy `RangerSheetCard.tsx`

### Integration Tasks

- [ ] Create `/battle` route in React Router
- [ ] Create battle main page component
- [ ] Integrate with existing card data
- [ ] Set up battle state initialization
- [ ] Add navigation from home to battle
- [ ] Style integration with existing theme

### Testing in HeroesGrid

- [ ] Test route navigation
- [ ] Test battle initialization
- [ ] Test dice animations
- [ ] Test full battle sequence
- [ ] Test character/enemy selection
- [ ] Test UI responsiveness
- [ ] Test theme compatibility (light/dark mode)
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

### Polish & Optimization

- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Optimize animations for performance
- [ ] Add accessibility features (keyboard nav, ARIA)
- [ ] Code cleanup and documentation

---

## File Inventory

### Source Files (hotg-battle)

**Location**: `/Users/jorgecastellonjr./Dev/personal/hotg-battle/packages/app/features/game/`

```
Battle/
├── AttackSequence.tsx
├── BattleOverlay.tsx
├── DiceControls.tsx
├── EnemyBattleSequence.tsx
└── RangerBattleSequence.tsx

Dice/
├── DiceFace.tsx
├── DiceGrid.tsx
├── DiceRoll.tsx
├── DiceSvg.tsx
├── useDiceRoll.ts
└── utils.ts

UI/
├── EnemyOptionsUI.tsx
├── RangerDeckOptionsUI.tsx
├── RangerInfoUI.tsx
├── RangerOptionsUI.tsx
├── SettingsSheet.tsx
├── SettingsUI.tsx
├── SheetFooter.tsx
└── UiOverlay.tsx
```

### Target Location (HeroesGrid)

**Location**: `/Users/jorgecastellonjr./Dev/personal/HeroesGrid/apps/web/src/features/battle/`

---

## Technical Notes

### Animation Conversion Reference

```tsx
// BEFORE (react-native-reanimated)
const animation = useSharedValue(0)
animation.value = withSequence(
  withSpring(1, { damping: 10 }),
  withTiming(2, { duration: 500 }),
  withSpring(3, { damping: 15 })
)

// AFTER (framer-motion)
const animation = useMotionValue(0)
animate(animation, [1, 2, 3], {
  type: "spring",
  damping: 10,
  duration: 0.5
})
```

### Component Pattern Reference

```tsx
// BEFORE (Tamagui)
<YStack gap="$4" alignItems="center">
  <Text fontSize={18} color="$gray11">Target: {targetText}</Text>
  <Button onPress={handlePress}>Roll Dice</Button>
</YStack>

// AFTER (Tailwind + Radix)
<div className="flex flex-col gap-4 items-center">
  <p className="text-lg text-gray-700 dark:text-gray-300">
    Target: {targetText}
  </p>
  <Button onClick={handlePress}>Roll Dice</Button>
</div>
```

### Key Dependencies

**To Add to HeroesGrid:**
- `framer-motion` - Web animations

**Already Available:**
- React Router - Routing
- Radix UI - UI primitives
- Tailwind - Styling
- Zustand (if needed for state) - Can be added

---

## Complexity Estimates

| Phase | Task | Complexity | Est. Time |
|-------|------|------------|-----------|
| 1 | Animation conversion | Medium | 3-4 days |
| 1 | Component conversion | Low-Medium | 4-5 days |
| 1 | Testing in hotg-battle | Medium | 2-3 days |
| 2 | File migration | Low | 1 day |
| 2 | Route integration | Low | 1 day |
| 2 | Testing in HeroesGrid | Medium | 2-3 days |
| 2 | Polish | Low | 1-2 days |
| **Total** | | | **14-19 days** |

---

## Success Criteria

- ✅ All battle animations work smoothly (60fps)
- ✅ Game logic functions identically to original
- ✅ Visual style matches HeroesGrid design system
- ✅ Works across Chrome, Firefox, and Safari
- ✅ Responsive on mobile and desktop
- ✅ No console errors or warnings
- ✅ Accessible keyboard navigation

---

## Next Steps

1. Create branch in hotg-battle: `git checkout -b feat/web-battle-conversion`
2. Start with animation system conversion (dice rolling)
3. Test each component individually before moving to next
4. Document any issues or edge cases discovered
5. Begin Phase 2 only after Phase 1 is fully tested

---

**Last Updated**: 2025-01-14  
**Status**: Planning Phase
