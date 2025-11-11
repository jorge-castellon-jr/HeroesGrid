# Heroes Grid - React App

The #1 companion app for Heroes of the Grid board game, now built with React!

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - CSS preprocessor
- **Sanity** - Headless CMS for content
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Installation

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Sanity project ID:
   ```
   VITE_SANITY_PROJECT_ID=your-project-id-here
   VITE_VERSION_NUMBER=1.3.2
   ```

### Development

Run the development server:

```bash
yarn dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the app:

```bash
yarn build
```

Preview the production build:

```bash
yarn preview
```

## Project Structure

```
react-web/
├── public/              # Static assets
│   ├── favicon/        # Favicon files
│   ├── svg/           # SVG icons
│   └── uploads/       # Image uploads
├── src/
│   ├── assets/        # SCSS styles
│   │   └── scss/
│   │       ├── plugins/
│   │       └── components/
│   ├── components/    # React components
│   │   ├── layout/    # Layout components
│   │   ├── cards/     # Card components
│   │   └── gameComponents/
│   ├── context/       # React Context for state management
│   ├── lib/          # Third-party integrations (Sanity)
│   ├── pages/        # Page components
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main App component
│   └── main.jsx      # Entry point
└── package.json
```

## Features

- **Ranger Database** - Browse all Power Rangers with filtering by team and color
- **Team Viewer** - View rangers organized by team
- **Dice Roller** - Digital dice roller for gameplay
- **Token Tracker** - Track game tokens
- **Randomizer** - Random ranger/team selection
- **Rulebooks** - Access game rulebooks

## Conversion from Vue/Nuxt

This app was converted from a Nuxt.js (Vue) application to React while maintaining identical functionality:

- Vuex → React Context API
- Vue Router → React Router
- Nuxt Content → Will need alternative solution
- Vue Components → React Components (functional)
- SCSS styles maintained as-is
- Tailwind configuration preserved

## Notes for Turbo Monorepo Migration

This project is currently standalone but will be migrated to a Turbo monorepo structure in the future. The directory structure is designed to facilitate that transition.

## License

See main project LICENSE file.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
