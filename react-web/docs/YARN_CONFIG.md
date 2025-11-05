# Yarn Configuration

## Node Linker: node_modules

This project uses Yarn with traditional `node_modules` instead of Plug'n'Play (PnP).

### Configuration

File: `.yarnrc.yml`
```yaml
nodeLinker: node-modules
```

### Why node_modules?

- Better compatibility with tools and IDEs
- Simpler debugging and development experience
- Easier integration with existing tooling
- Matches the Vue app's setup (which also uses node_modules)

### Migration from PnP

The following changes were made to switch from PnP to node_modules:

1. Created `.yarnrc.yml` with `nodeLinker: node-modules`
2. Removed PnP files:
   - `.pnp.cjs`
   - `.pnp.loader.mjs`
   - `.yarn/cache/`
   - `.yarn/unplugged/`
3. Updated ESLint config to ignore `node_modules` instead of PnP files
4. Ran `yarn install` to generate `node_modules/`

### Directory Structure

```
react-web/
├── node_modules/          # All dependencies (gitignored)
├── .yarn/
│   └── install-state.gz   # Yarn install state
├── .yarnrc.yml           # Yarn configuration
└── yarn.lock             # Dependency lock file
```

### Verification

All checks pass with node_modules:
- ✅ TypeScript: `yarn tsc --noEmit`
- ✅ ESLint: `yarn lint`
- ✅ Build: `yarn build`
- ✅ Dev Server: `yarn dev`

### Git Configuration

The `.gitignore` file properly excludes:
- `node_modules/`
- Build outputs (`dist/`)
- Environment files (`.env*`)
- Editor configs

### Benefits

1. **Compatibility**: Works seamlessly with all tools and IDEs
2. **Familiarity**: Standard Node.js module resolution
3. **Debugging**: Easy to inspect dependencies in `node_modules/`
4. **Consistency**: Matches the Vue app's dependency management approach
