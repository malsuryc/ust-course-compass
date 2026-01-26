# CI/CD Guide

This project uses GitHub Actions for continuous integration and deployment. Here's how it works!

## Quick Start

### Making Changes

```bash
# 1. Create a new branch for your work
git checkout -b feature/my-awesome-feature

# 2. Make your changes...
# ...edit files, add features, fix bugs...

# 3. Add a changeset to describe what you did
npm run changeset
# Choose: patch (bug fix), minor (new feature), or major (breaking change)
# Write a brief description of what changed

# 4. Commit everything
git add .
git commit -m "feat: add my awesome feature"

# 5. Push and create a PR
git push -u origin feature/my-awesome-feature
# Then open a Pull Request on GitHub
```

## What Happens Automatically

### When You Open a Pull Request

1. **CI Checks Run** - The `ci.yml` workflow kicks in:
   - Lints your code (catches style issues)
   - Builds the project (catches TypeScript errors)
   - If either fails, you'll see a red ❌ on your PR

2. **Preview Deployment** (if Vercel secrets are configured):
   - Your changes are deployed to a preview URL
   - Great for testing before merging!

### When Your PR is Merged

1. **Release Workflow Runs** - The `release.yml` workflow:
   - Checks if there are any changesets
   - If yes: Creates a "Release PR" with version bumps and changelog updates
   - The Release PR stays open until you're ready to release

2. **When You Merge the Release PR**:
   - Version in `package.json` is updated
   - `CHANGELOG.md` is updated with your changes
   - A git tag is created (e.g., `v0.2.0`)
   - A GitHub Release is published

3. **Production Deployment**:
   - The `deploy.yml` workflow triggers
   - Your site is deployed to production!

## Understanding Version Numbers

```
v0.1.0 → v0.1.1  (patch)  - Bug fixes, small changes
v0.1.0 → v0.2.0  (minor)  - New features, backward compatible
v0.1.0 → v1.0.0  (major)  - Breaking changes
```

## The Changeset

A changeset is a file that describes what changed. When you run `npm run changeset`:

1. Select which type of change (patch/minor/major)
2. Write a brief description
3. A file is created in `.changeset/` folder

This file is used later to:
- Determine how to bump the version
- Generate the CHANGELOG entry

## Workflow Files

| File | Purpose | When It Runs |
|------|---------|--------------|
| `.github/workflows/ci.yml` | Lint + Build checks | On every PR |
| `.github/workflows/release.yml` | Version management | On push to main |
| `.github/workflows/deploy.yml` | Vercel deployment | PRs (preview) + Releases (prod) |

## Required Secrets

For deployment to work, add these secrets in GitHub → Settings → Secrets → Actions:

| Secret | Where to Get It |
|--------|-----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | In `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | In `.vercel/project.json` after running `vercel link` |

## Common Commands

```bash
# Add a changeset (describe your changes)
npm run changeset

# Check what version bump would happen
npm run version

# Run lint locally
npm run lint

# Build locally
npm run build
```

## Troubleshooting

### CI is failing

1. Check the error in GitHub Actions
2. Run `npm run lint` locally to see linting errors
3. Run `npm run build` locally to see build errors
4. Fix the issues and push again

### Deploy is failing

1. Make sure you've added all 3 Vercel secrets
2. Check that your project is linked: `vercel link`
3. Try building locally: `vercel build`

### Release PR not appearing

1. Make sure you've added a changeset file
2. Check that changesets exist in `.changeset/` folder
3. Merge any pending changesets to main first
