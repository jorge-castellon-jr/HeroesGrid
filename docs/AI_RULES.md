# AI Rules for HeroesGrid Project

> **Purpose**: This file contains rules and guidelines for AI assistants working on this project. Update this file as needed when new patterns or requirements emerge.

## Core Project Rules

### 1. Documentation Management

- **Always check boxes** `[x]` for completed tasks in markdown files
- **Run `yarn build`** after any big task or phase to verify nothing broke
- **Clean up after yourself** - Remove temporary files, unused code, and outdated comments
- **Move completed task files** to `docs/completed/` when all checkboxes are marked
- **Use this rule file** as reference for project-specific conventions

### 2. Package Management

- Use **yarn** as the package manager (not npm or pnpm)
- Dependencies are managed via **node_modules** (not PnP)
- Always check `package.json` version compatibility before adding new packages

### 3. Build & Verification Process

After completing any major task or phase:

```bash
# 1. Run linter
yarn lint

# 2. Type check (if TypeScript is configured)
yarn tsc --noEmit

# 3. Build the project
yarn build
```

If any of these fail, **fix the issues before marking task as complete**.

### 4. File Organization

**Documentation Structure:**
- `docs/completed/` - Completed task files (all checkboxes marked ✅)
- `docs/in-progress/` - Active tasks with uncompleted checkboxes
- `docs/information/` - Reference documentation, guides, and architecture docs

**Task File Lifecycle:**
1. Create task file in `docs/in-progress/`
2. Work through checklist, marking `[x]` as you complete items
3. Run verification steps (lint, typecheck, build)
4. When ALL tasks complete, move file to `docs/completed/`

### 5. Code Quality Standards

- **Preserve existing patterns** - Match the style of surrounding code
- **Add JSDoc comments** for utility functions and complex logic
- **Use descriptive variable names** - Avoid single-letter vars except in loops
- **Handle edge cases** - Add validation and error handling
- **No console.log in production** - Use proper logging or remove debug code

### 6. Database & Schema Changes

When modifying database schema:
1. Update the model file (`src/database/models/`)
2. Update schema version in `src/database/schema.js`
3. Create migration if needed in `src/database/migrations.js`
4. Test data persistence and retrieval
5. Document schema changes in relevant markdown files

### 7. Component Development

- **Reuse existing components** before creating new ones
- **Match existing UI patterns** - Use the same spacing, colors, and styles
- **Responsive by default** - Test mobile and desktop layouts
- **Accessibility** - Add ARIA labels, keyboard navigation where needed
- **Empty states** - Always provide helpful guidance when no data exists

### 8. Git Workflow

- **Commit frequently** with clear, descriptive messages
- **Do not commit** until explicitly asked by the user
- **Test before committing** - Run build and verify functionality
- Format commit messages: `<type>: <description>`
  - Types: feat, fix, docs, refactor, test, chore

### 9. Testing Requirements

Before marking any feature as complete:
- [ ] Manual testing in development environment
- [ ] Test edge cases and error conditions
- [ ] Test with empty/missing data
- [ ] Verify backward compatibility (if applicable)
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)

### 10. Project-Specific Patterns

#### WatermelonDB Usage
- Always use `@json()` decorator for JSON fields
- Index frequently queried fields
- Use relationships for foreign keys
- Lazy load data when possible

#### React Patterns
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Extract logic to custom hooks or utilities

#### Styling
- Use Tailwind CSS utility classes
- Follow existing spacing/sizing patterns
- Dark mode support via Tailwind's `dark:` prefix
- Consistent color usage (check existing color palette)

## Common Tasks Checklist

### Adding a New Feature
- [ ] Create task markdown file in `docs/in-progress/`
- [ ] Break down into phases with checkboxes
- [ ] Implement feature following project patterns
- [ ] Add tests (if test suite exists)
- [ ] Update documentation
- [ ] Run `yarn lint && yarn build`
- [ ] Mark all checkboxes as complete
- [ ] Move task file to `docs/completed/`

### Fixing a Bug
- [ ] Identify root cause
- [ ] Create fix following existing patterns
- [ ] Test fix thoroughly
- [ ] Check for similar issues elsewhere
- [ ] Run `yarn lint && yarn build`
- [ ] Document fix if non-obvious

### Refactoring Code
- [ ] Ensure tests pass (if they exist)
- [ ] Refactor incrementally
- [ ] Verify functionality unchanged
- [ ] Run `yarn lint && yarn build`
- [ ] Update relevant documentation

## Troubleshooting

### Build Failures
1. Check for TypeScript errors: `yarn tsc --noEmit`
2. Check for linting errors: `yarn lint`
3. Clear cache: `rm -rf node_modules/.vite`
4. Reinstall dependencies: `yarn install`

### Database Issues
1. Check schema version matches migration
2. Verify WatermelonDB indexes are correct
3. Clear IndexedDB via browser DevTools
4. Re-seed data if needed

### Style Issues
1. Verify Tailwind classes are valid
2. Check for conflicting styles
3. Test in browser DevTools
4. Check dark mode variants

## Resources

### Important Files
- `package.json` - Dependencies and scripts
- `vite.config.js` - Build configuration
- `src/database/schema.js` - Database schema
- `tailwind.config.js` - Styling configuration

### Documentation Locations
- Architecture docs: `docs/information/`
- Completed tasks: `docs/completed/`
- Active tasks: `docs/in-progress/`
- User guides: Look for `*_USER_GUIDE.md` files

## Notes

- This project is a **monorepo** using Turborepo (or migrating to it)
- Primary app is in `apps/web/`
- Uses **WatermelonDB** for local-first data storage
- Designed as a **PWA** with offline support
- **No backend** required - fully browser-based

---

**Last Updated**: 2025-01-17  
**Schema Version**: 9  
**Project Status**: Active Development
