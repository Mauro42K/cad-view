# CAD View - Upstream Updates

This document tracks how to consume dependency updates from upstream packages, especially `@mlightcad/*`.

## What Dependabot does here

- Watches dependency manifests weekly.
- Opens pull requests against `main`.
- Does not merge changes automatically.
- Does not deploy anything.

## Verification status

- `.github/dependabot.yml` exists in `main`.
- The YAML parses successfully.
- Configuration targets `npm` at `/` on a weekly schedule.
- `target-branch: main` is set.
- No auto-merge configuration exists in this repo file.
- GitHub CLI verification on `Mauro42K/cad-view` found no open Dependabot PRs and no visible `dependabot/*` branches.
- GitHub API reported that Dependabot alerts are disabled for this repository, so alert-driven update flow is not currently active.

## Review flow for dependency PRs

1. Inspect the package diff.
2. Check upstream release notes.
3. Verify workers and static assets still resolve.
4. Run `pnpm build`.
5. Test at least one DWG and one DXF locally.
6. Merge only after the change is understood and validated.

## Special notes for `@mlightcad`

These packages are the most likely to affect runtime behavior:

- `@mlightcad/cad-simple-viewer`
- `@mlightcad/cad-simple-ui-plugin`

When either one changes, also check:

- asset copy paths
- worker filenames
- CDN or local font base URL assumptions
- any new environment variables

## Update policy

- No automatic dependency merges.
- No silent major upgrades.
- No production rollout until validation passes locally.
