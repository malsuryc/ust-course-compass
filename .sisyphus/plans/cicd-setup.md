# CI/CD Pipeline Setup for UST Course Visualizer

## Context

### Original Request
Guide me on how to integrate GitHub tags, actions, changesets, and Vercel deploy into this project for a CI/CD practice. Assume I am new to CI/CD so make them easy to understand.

### Interview Summary
**Key Discussions**:
- User is new to CI/CD, wants beginner-friendly setup
- Already has v0.1.0 tag pushed and changesets installed
- Wants Basic CI checks (lint + build) on PRs
- Wants GitHub-style changelog with PR links and authors
- Wants fully automated deployment via GitHub Actions using Vercel CLI
- Prefers manual batch releases (accumulate changesets, release when ready)

**Project State**:
- Next.js 16.1.4 application
- Package: `ust-course-visualizer` v0.1.0 (private)
- GitHub repo: `malsuryc/ust-course-compass`
- Existing scripts: `dev`, `build`, `start`, `lint` (no tests)
- Changesets already initialized with basic config

### Research Findings
- Use `@changesets/changelog-github` for PR/author links in CHANGELOG
- Use `changesets/action` for automated version bumping and tag creation
- Vercel CLI deployment requires 3 secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Preview deploys on PRs, production deploys on release tags

---

## Work Objectives

### Core Objective
Set up a complete CI/CD pipeline that automatically checks code quality on PRs, manages versions with changesets, and deploys to Vercel on releases.

### Concrete Deliverables
1. `.github/workflows/ci.yml` - PR checks workflow
2. `.github/workflows/release.yml` - Version & release workflow  
3. `.github/workflows/deploy.yml` - Vercel deployment workflow
4. Updated `.changeset/config.json` - GitHub-style changelog
5. Updated `package.json` - Release script
6. Documentation in repo explaining the CI/CD flow

### Definition of Done
- [ ] Opening a PR triggers lint + build checks
- [ ] Merging to main with changesets triggers a "Release PR" creation
- [ ] Merging the Release PR creates a git tag and GitHub Release
- [ ] New tags trigger automatic Vercel deployment
- [ ] CHANGELOG.md is auto-generated with PR links

### Must Have
- All 3 workflow files functional
- Vercel secrets documented (user must add them)
- Clear comments in workflow files explaining each step

### Must NOT Have (Guardrails)
- ❌ Auto-publish to npm (this is a private app, not a package)
- ❌ Test steps in CI (no test infrastructure exists)
- ❌ Complex monorepo setup (single package only)
- ❌ Multiple environment deployments (production only for now)
- ❌ Automatic releases on every merge (user wants manual batch control)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test scripts)
- **User wants tests**: SKIP (focus on CI/CD learning)
- **Framework**: N/A

### Manual QA Approach

Each TODO includes verification via:
- **GitHub UI**: Check workflow runs, PR comments, releases
- **Terminal**: Run commands locally to verify configs
- **Vercel Dashboard**: Verify deployments

---

## Task Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TASK DEPENDENCIES                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [0. Vercel Setup] ──────────────────────────────────────┐             │
│         │                                                  ↓             │
│         │                                    [4. Deploy Workflow]       │
│         │                                                               │
│   [1. Changelog Config]                                                 │
│         │                                                               │
│         ↓                                                               │
│   [2. CI Workflow] ←── can run in parallel ──→ [3. Release Workflow]   │
│                                                        │                │
│                                                        ↓                │
│                                              [5. Test Full Flow]        │
│                                                        │                │
│                                                        ↓                │
│                                              [6. Documentation]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 2, 3 | Independent workflow files |

| Task | Depends On | Reason |
|------|------------|--------|
| 3 (Release) | 1 (Changelog) | Release workflow uses changelog config |
| 4 (Deploy) | 0 (Vercel Setup) | Needs Vercel project linked |
| 5 (Test Flow) | 2, 3, 4 | Needs all workflows in place |
| 6 (Docs) | 5 | Document after verifying everything works |

---

## TODOs

### Prerequisites (User Manual Steps)

> ⚠️ **BEFORE running /start-work, the user MUST complete these manual steps:**

#### P1. Link Project to Vercel

**Why**: GitHub Actions needs Vercel credentials to deploy.

**Steps**:
1. Install Vercel CLI if not installed:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link this project (run in project root):
   ```bash
   vercel link
   ```
   - Select your Vercel account
   - Link to existing project OR create new one
   - This creates `.vercel/project.json` with your project ID

4. Get your credentials:
   ```bash
   # Get your token from: https://vercel.com/account/tokens
   # Create a new token with "Full Account" scope
   
   # Your Org ID and Project ID are in .vercel/project.json:
   cat .vercel/project.json
   # Shows: {"orgId": "xxx", "projectId": "yyy"}
   ```

#### P2. Add GitHub Secrets

**Why**: Workflows need these secrets to authenticate with Vercel.

**Steps**:
1. Go to: `https://github.com/malsuryc/ust-course-compass/settings/secrets/actions`
2. Click "New repository secret"
3. Add these 3 secrets:
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`

**Verification**:
- [x] `.vercel/project.json` exists locally
- [ ] All 3 secrets visible in GitHub Settings → Secrets → Actions

---

### Implementation Tasks

- [x] 0. Install GitHub Changelog Package

  **What to do**:
  - Install `@changesets/changelog-github` as a dev dependency
  - This package generates changelogs with PR links and author credits

  **Must NOT do**:
  - Don't install any other changelog packages
  - Don't modify the changeset config yet (that's task 1)

  **Parallelizable**: NO (foundational dependency)

  **References**:
  - `package.json:19-31` - devDependencies section where to add
  - https://github.com/changesets/changesets/tree/main/packages/changelog-github - Official package docs

  **Acceptance Criteria**:
  - [x] Run: `npm install -D @changesets/changelog-github`
  - [x] Verify: `cat package.json | grep changelog-github` shows the package
  - [x] Verify: `ls node_modules/@changesets/changelog-github` exists

  **Commit**: YES
  - Message: `chore(deps): add changesets github changelog package`
  - Files: `package.json`, `package-lock.json` (if exists) or lockfile

---

- [x] 1. Update Changeset Config for GitHub Changelog

  **What to do**:
  - Modify `.changeset/config.json` to use the GitHub changelog format
  - Change `changelog` from `"@changesets/cli/changelog"` to the GitHub package with repo config

  **Must NOT do**:
  - Don't change `access` (keep "restricted" for private repo)
  - Don't enable `commit: true` (let GitHub Actions handle commits)

  **Parallelizable**: NO (must complete before release workflow)

  **References**:
  - `.changeset/config.json:1-11` - Current config to modify
  - https://github.com/changesets/changesets/blob/main/docs/config-file-options.md - Config options
  - Example config:
    ```json
    {
      "changelog": ["@changesets/changelog-github", { "repo": "malsuryc/ust-course-compass" }],
      ...rest stays the same
    }
    ```

  **Acceptance Criteria**:
  - [x] Config updated with GitHub changelog package and repo name
  - [x] Run: `npx changeset` → Create a test changeset
  - [x] Verify changeset file created in `.changeset/` folder
  - [x] Delete the test changeset (it was just for verification)

  **Commit**: YES
  - Message: `chore(changeset): configure github-style changelog`
  - Files: `.changeset/config.json`

---

- [x] 2. Create CI Workflow (PR Checks)

  **What to do**:
  - Create `.github/workflows/ci.yml`
  - Trigger on: pull requests to main
  - Jobs: checkout → setup node → install deps → lint → build
  - Add helpful comments explaining each step (beginner-friendly)

  **Must NOT do**:
  - Don't add test step (no tests exist)
  - Don't deploy anything (that's a separate workflow)
  - Don't run on push to main (only PRs)

  **Parallelizable**: YES (with task 3)

  **References**:
  - `package.json:5-10` - Scripts to call (lint, build)
  - https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions - Syntax reference
  - Example structure:
    ```yaml
    name: CI
    on:
      pull_request:
        branches: [main]
    jobs:
      check:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '20'
          - run: npm ci
          - run: npm run lint
          - run: npm run build
    ```

  **Acceptance Criteria**:
  - [x] File exists: `.github/workflows/ci.yml`
  - [x] YAML is valid: `npx yaml-lint .github/workflows/ci.yml` (or use online validator)
  - [x] Each step has a `name` field with clear description
  - [x] Comments explain what the workflow does for beginners

  **Commit**: YES
  - Message: `ci: add PR checks workflow (lint + build)`
  - Files: `.github/workflows/ci.yml`

---

- [x] 3. Create Release Workflow (Changesets)

  **What to do**:
  - Create `.github/workflows/release.yml`
  - Trigger on: push to main
  - Use `changesets/action` to either:
    - Create/update a "Release PR" when changesets exist
    - Publish (create git tag + GitHub release) when Release PR is merged
  - Add comments explaining the two-mode behavior

  **Must NOT do**:
  - Don't add `publish` command (this is not an npm package)
  - Don't auto-commit version changes (let the action handle it)
  - Don't trigger deployment here (separate workflow)

  **Parallelizable**: YES (with task 2)

  **References**:
  - `.changeset/config.json` - Uses this config
  - https://github.com/changesets/action - Official action docs
  - Example structure:
    ```yaml
    name: Release
    on:
      push:
        branches: [main]
    
    concurrency: ${{ github.workflow }}-${{ github.ref }}
    
    jobs:
      release:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version: '20'
          - run: npm ci
          - uses: changesets/action@v1
            with:
              title: "chore: release"
              commit: "chore: release"
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ```

  **Acceptance Criteria**:
  - [x] File exists: `.github/workflows/release.yml`
  - [x] YAML is valid (lint or online validator)
  - [x] Uses `concurrency` to prevent race conditions
  - [x] Does NOT have `publish` npm command
  - [x] Comments explain the Release PR workflow

  **Commit**: YES
  - Message: `ci: add release workflow with changesets`
  - Files: `.github/workflows/release.yml`

---

- [x] 4. Create Deploy Workflow (Vercel)

  **What to do**:
  - Create `.github/workflows/deploy.yml`
  - Two triggers:
    - `pull_request` → Preview deployment
    - `push` to main OR `release` published → Production deployment
  - Use Vercel CLI commands (not the Vercel GitHub action)
  - Add comments explaining preview vs production

  **Must NOT do**:
  - Don't use `amondnet/vercel-action` (user wants to learn CLI approach)
  - Don't hardcode any secrets
  - Don't deploy on every push to main (only on release)

  **Parallelizable**: NO (depends on Vercel setup)

  **References**:
  - https://vercel.com/guides/how-can-i-use-github-actions-with-vercel - Official guide
  - Example structure:
    ```yaml
    name: Deploy
    
    on:
      pull_request:
        branches: [main]
      release:
        types: [published]
    
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    
    jobs:
      deploy-preview:
        if: github.event_name == 'pull_request'
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - run: npm install -g vercel
          - run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
    
      deploy-production:
        if: github.event_name == 'release'
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - run: npm install -g vercel
          - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
    ```

  **Acceptance Criteria**:
  - [x] File exists: `.github/workflows/deploy.yml`
  - [x] YAML is valid
  - [x] Has separate jobs for preview and production
  - [x] Uses `if` conditions correctly for each trigger
  - [x] All 3 Vercel secrets are referenced (not hardcoded)
  - [x] Comments explain when each job runs

  **Commit**: YES
  - Message: `ci: add vercel deployment workflow`
  - Files: `.github/workflows/deploy.yml`

---

- [x] 5. Add Version Script to package.json

  **What to do**:
  - Add a `release` or `version` script for local changeset operations
  - This makes it easier to run changeset commands

  **Must NOT do**:
  - Don't add npm publish commands
  - Don't modify existing scripts

  **Parallelizable**: YES (with tasks 2-4)

  **References**:
  - `package.json:5-10` - Scripts section
  - Add: `"changeset": "changeset"` and `"version": "changeset version"`

  **Acceptance Criteria**:
  - [x] Run: `npm run changeset` → Opens changeset CLI
  - [x] Run: `npm run version` → Would apply version bumps (don't actually run if no changesets)

  **Commit**: YES (can combine with task 0)
  - Message: `chore: add changeset scripts to package.json`
  - Files: `package.json`

---

- [ ] 6. Test the Complete CI/CD Flow (⚠️ BLOCKED: Requires user to push to GitHub and add secrets)

  **What to do**:
  - Create a test branch with a small change
  - Add a changeset describing the change
  - Open a PR and verify CI runs
  - (Optional) Merge and verify Release PR is created
  
  **Verification Steps**:
  
  1. **Create test branch**:
     ```bash
     git checkout -b test/cicd-verification
     ```
  
  2. **Make a small change** (e.g., update README):
     ```bash
     echo "\n<!-- CI/CD test -->" >> README.md
     ```
  
  3. **Create a changeset**:
     ```bash
     npm run changeset
     # Select: patch
     # Summary: "test: verify CI/CD pipeline"
     ```
  
  4. **Commit and push**:
     ```bash
     git add .
     git commit -m "test: verify cicd pipeline"
     git push -u origin test/cicd-verification
     ```
  
  5. **Open PR on GitHub** and verify:
     - [ ] CI workflow triggers (lint + build)
     - [ ] CI passes (green checkmark)
     - [ ] Preview deployment triggers (if Vercel secrets configured)
  
  6. **After merge** (optional, to test full flow):
     - [ ] Release workflow creates "Release PR"
     - [ ] Merging Release PR creates tag + GitHub Release
     - [ ] Production deployment triggers

  **Must NOT do**:
  - Don't merge to main if CI fails
  - Don't force-push or skip CI checks

  **Parallelizable**: NO (final verification step)

  **Acceptance Criteria**:
  - [ ] CI workflow visible in Actions tab
  - [ ] Lint step passes
  - [ ] Build step passes
  - [ ] (If Vercel configured) Preview URL appears in PR

  **Commit**: Optional - can delete test branch after verification

---

- [x] 7. Create CI/CD Documentation

  **What to do**:
  - Create `docs/CICD.md` or add section to README
  - Explain the workflow for future contributors
  - Include diagrams if helpful

  **Content to include**:
  - How to add a changeset when making changes
  - What happens when PR is opened (CI checks)
  - What happens when PR is merged (Release PR)
  - How releases work (merge Release PR → tag → deploy)
  - How to check deployment status

  **Must NOT do**:
  - Don't include secrets or tokens
  - Don't make it too complex (beginner audience)

  **Parallelizable**: NO (document after verification)

  **References**:
  - All workflow files created in tasks 2-4
  - https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md - Reference for changeset docs

  **Acceptance Criteria**:
  - [x] Documentation file exists
  - [x] Covers: changesets, CI checks, releases, deployments
  - [x] Has example commands for common operations
  - [x] A newcomer could understand the workflow from reading it

  **Commit**: YES
  - Message: `docs: add CI/CD workflow documentation`
  - Files: `docs/CICD.md` or `README.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `chore(deps): add changesets github changelog package` | package.json, lockfile | npm ls @changesets/changelog-github |
| 1 | `chore(changeset): configure github-style changelog` | .changeset/config.json | npx changeset (creates file) |
| 2 | `ci: add PR checks workflow (lint + build)` | .github/workflows/ci.yml | YAML lint |
| 3 | `ci: add release workflow with changesets` | .github/workflows/release.yml | YAML lint |
| 4 | `ci: add vercel deployment workflow` | .github/workflows/deploy.yml | YAML lint |
| 5 | `chore: add changeset scripts to package.json` | package.json | npm run changeset |
| 6 | (testing - may not commit) | - | CI passes on test PR |
| 7 | `docs: add CI/CD workflow documentation` | docs/CICD.md | File readable |

---

## Success Criteria

### Verification Commands
```bash
# All workflow files exist
ls .github/workflows/
# Expected: ci.yml  deploy.yml  release.yml

# Changeset config has GitHub changelog
cat .changeset/config.json | grep changelog-github
# Expected: shows the package name

# Changeset scripts work
npm run changeset -- --help
# Expected: shows changeset help
```

### Final Checklist
- [ ] Opening a PR → CI workflow runs lint + build
- [ ] CI passes → Green checkmark on PR
- [ ] PR has changeset → Release workflow will create Release PR after merge
- [ ] Merging Release PR → Git tag created (e.g., v0.2.0)
- [ ] New release → Vercel production deployment triggers
- [ ] PR opened → Preview deployment (if secrets configured)
- [ ] CHANGELOG.md → Shows PR links and author names
- [ ] Documentation → New contributor can understand the flow

---

## Quick Reference for User

### Daily Workflow

```bash
# 1. Make your changes on a branch
git checkout -b feature/my-change

# 2. Add a changeset (describes your change)
npm run changeset
# Choose: patch (bug fix), minor (new feature), or major (breaking change)
# Write: Brief description of what changed

# 3. Commit everything
git add .
git commit -m "feat: add my new feature"

# 4. Push and open PR
git push -u origin feature/my-change
# → CI will automatically check your code!

# 5. After PR is approved and merged
# → A "Release PR" will be created automatically
# → Merge the Release PR when ready to release
# → Version bump + tag + deployment happens automatically!
```

### Understanding Version Numbers

```
v0.1.0 → v0.1.1  (patch: bug fixes)
v0.1.0 → v0.2.0  (minor: new features)  
v0.1.0 → v1.0.0  (major: breaking changes)
```
