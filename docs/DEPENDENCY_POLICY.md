# Dependency policy

## Default behavior

Dependabot runs weekly for the pnpm workspace, keeps at most eight open update
PRs, and applies `dependencies`, `javascript`, and `dependabot` labels. Patch
and minor updates for development dependencies may be grouped. Major updates
remain separate and always require manual review. Security updates are not
ignored by this policy.

`pdfjs-dist` is excluded from every group and must remain an individual PR. It
is used by the PDF plugin and can directly affect viewer behavior, rendering,
and compatibility, so even a technically green PR needs targeted review.

## Selective auto-merge

The auto-merge workflow only enables GitHub auto-merge when all of these are
true: the PR is authored by Dependabot, the Dependabot metadata says patch or
minor, the dependency is declared only in `devDependencies` in the base
revision's manifest, the dependency is not `pdfjs-dist`, only package manifests
and `pnpm-lock.yaml` changed, the merge state is clean, and `lint`,
`typecheck`, `test`, and `build` all pass. `manual-review` and `do-not-merge`
always block it. Missing or ambiguous Dependabot metadata, manifest data, file
patches, checks, or merge state makes the PR ineligible. No merge is forced;
GitHub branch protection and required reviews still apply.

The workflow is intentionally disabled until the repository variable
`ENABLE_DEPENDABOT_AUTOMERGE` is explicitly set to `true`. This prevents a
configuration-only publication from activating auto-merge on existing PRs.

To block an eligible PR, add `manual-review` or `do-not-merge`. The optional
`automerge-candidate` label is applied only when that label already exists in
the repository. Removing it does not by itself permit unsafe updates; the
workflow re-evaluates every relevant PR event.

## Reviewing Dependabot PRs

Run the full CI checks and review the dependency's release notes, package
engine requirements, lockfile changes, and affected workspace. For
`pdfjs-dist`, exercise the PDF viewer with representative documents. Major
updates such as `eslint-config-prettier` 10 and `rollup-plugin-visualizer` 7
are manual by policy; the latter is ESM-only and requires Node 22+, although
this repository currently targets Node 24. `ts-jest` must remain compatible
with Jest 30, TypeScript, and Node 24.

`@changesets/cli` is currently declared but no `.changeset` configuration or
usage was found, so its update is best deferred until the release workflow
needs it.

## Upstream synchronization

This repository is an independent copy, not an officially synchronized fork.
Dependabot updates dependencies only; it does not synchronize source code or
history from `mlightcad/cad-viewer` (or another upstream). Upstream sync must
be a separate, deliberate review with an explicit source, diff, and validation.

## Required GitHub setup

Keep `main` protected and require the `lint`, `typecheck`, `test`, and `build`
checks before merging. Enable “Allow auto-merge” at repository level if the
selective workflow should be allowed to queue a squash merge, and set
`ENABLE_DEPENDABOT_AUTOMERGE=true` only after an explicit policy decision. Do not grant
Dependabot or workflows blanket bypass permissions, and do not add secrets to
these workflows. The current checkout has `test/mocks/three` fixtures restored
from upstream, and `jest.config.ts` maps to them. The
agent plugin also has no bounded standalone typecheck target; its existing
build remains covered by the build gate, while `typecheck` runs the available
`tsc`/`vue-tsc` checks for the other workspaces.
