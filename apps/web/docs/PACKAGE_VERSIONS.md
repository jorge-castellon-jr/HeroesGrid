# Package Version Matching

This document tracks which packages were matched between the Vue and React apps to ensure consistency.

## Matched Packages (Non-Vue/React specific)

### Dependencies
| Package | Version | Source |
|---------|---------|--------|
| @sanity/client | 2.11.0 | Matched from Vue app |
| @sanity/image-url | 0.140.22 | Matched from Vue app |
| marked | ^2.1.3 | Matched from Vue app |
| postcss-nested | ^4.2.1 | Matched from Vue app |
| prettier | ^2.3.2 | Matched from Vue app |

### Dev Dependencies
| Package | Version | Source |
|---------|---------|--------|
| @sanity/cli | ^2.0.5 | Matched from Vue app |
| localtunnel | ^2.0.1 | Matched from Vue app |
| sass | ^1.35.1 | Matched from Vue app |
| tailwindcss | ^2.2.0 | Compatible with Vue app's @nuxtjs/tailwindcss v4.2.0 |
| autoprefixer | ^10.4.0 | Compatible version |
| postcss | ^8.4.0 | Compatible version |

## React-Specific Packages (Not in Vue app)

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.1 | Core React library |
| react-dom | ^19.1.1 | React DOM renderer |
| react-router-dom | ^7.9.5 | Client-side routing |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @vitejs/plugin-react | ^5.0.4 | Vite React plugin |
| vite | ^7.1.7 | Build tool (replaces Nuxt) |
| eslint | ^9.36.0 | Linting |
| @eslint/js | ^9.36.0 | ESLint JS config |
| eslint-plugin-react-hooks | ^5.2.0 | React hooks linting |
| eslint-plugin-react-refresh | ^0.4.22 | React refresh linting |
| @types/react | ^19.1.16 | TypeScript types |
| @types/react-dom | ^19.1.9 | TypeScript types |
| globals | ^16.4.0 | Global variables for ESLint |

## Vue-Specific Packages (Removed from React app)

These packages were in the Vue app but are not needed in React:

- @headlessui/vue → Could use @headlessui/react if needed
- @nuxt/content → Content handling will need alternative solution
- @nuxtjs/pwa → PWA handling can be added separately if needed
- @nuxtjs/tailwindcss → Using regular tailwindcss instead
- nuxt → Replaced by Vite
- node-sass → Not needed with modern sass
- sass-loader → Not needed with Vite
- nuxt-vite → Not needed, using regular Vite

## Configuration Changes

### Tailwind CSS
- Vue app: Uses @nuxtjs/tailwindcss v4.2.0 (which includes Tailwind v2)
- React app: Uses tailwindcss v2.2.0 directly
- Configuration: Adapted from ESM to CommonJS for v2 compatibility

### PostCSS
- Both apps use similar PostCSS configuration
- Added postcss-nested as it was in the Vue app

### Build Tool
- Vue app: Nuxt.js (includes Webpack/Vite)
- React app: Vite
- Both are compatible modern build tools

## Scripts Added

Added `prettier` script to match Vue app:
```json
"prettier": "prettier --config .prettierrc --write ."
```

## Notes

1. All non-framework-specific packages are using the exact same versions as the Vue app
2. Tailwind CSS v2 is used to maintain compatibility with the Vue app's setup
3. Sass version matches the Vue app
4. Sanity packages use exact versions from Vue app
5. The app successfully starts and runs with these versions
