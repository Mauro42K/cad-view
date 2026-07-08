# F3.1 Dependabot Verification

Date: 2026-07-08

## Local checks

- `.github/dependabot.yml` exists in the current `main` checkout.
- The file is tracked in Git.
- The YAML parses successfully.
- The configuration is:
  - `package-ecosystem: npm`
  - `directory: /`
  - `schedule.interval: weekly`
  - `target-branch: main`
  - `open-pull-requests-limit: 5`
- There is no auto-merge configuration in the file.

## Git state

- `HEAD` is not yet equal to `origin/main` in this workspace.
- `HEAD`: `3898219 chore: add Vercel deployment setup`
- `origin/main`: `3676786 fix: track CAD visual ready baseline`

## GitHub CLI checks

- `gh` is installed and authenticated for `github.com` as `Mauro42K`.
- Repository: `Mauro42K/cad-view`
- Default branch: `main`
- Open pull requests: none.
- Dependabot branches: none visible in the repo branch list.
- Dependabot alerts: disabled for this repository.
- Vulnerability alerts: disabled.

## Auto-merge

- No auto-merge configuration was found in the Dependabot YAML.
- No open Dependabot PRs were present to inspect for merge automation.

## Optional local update signal

- `pnpm outdated --depth 0` reports available updates for:
  - `@types/node`
  - `@vitejs/plugin-vue`
  - `typescript`
  - `vite`
  - `vite-plugin-static-copy`
- No dependency files were changed for this verification.

## Manual GitHub UI checks

If GitHub CLI access is unavailable or restricted, review these pages in the GitHub UI:

1. `Settings` -> `Code security and analysis`
   - Confirm `Dependabot alerts` is enabled if you expect alert-driven updates.
   - Confirm `Dependabot security updates` is enabled if you expect auto-PRs for security advisories.
2. `Pull requests`
   - Look for open Dependabot PRs.
   - Verify there is no merge automation or branch protection rule that auto-merges Dependabot updates.
3. `Branches`
   - Look for `dependabot/*` branches.
4. `.github/dependabot.yml`
   - Confirm the file matches the `main` branch contents and schedules weekly `npm` updates from `/`.

## Conclusion

- The repo is configured for weekly Dependabot updates on `npm` from `/` into `main`.
- There is no local evidence of auto-merge.
- GitHub-side alert-driven Dependabot features are currently disabled for this repository, so the workflow is not fully operational until that is enabled in GitHub settings.
