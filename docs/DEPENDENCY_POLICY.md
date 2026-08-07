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

## Current GitHub merge controls

This repository is private on GitHub Free. `main` is not currently protected:
branch protection rules and rulesets for private repositories require a higher
GitHub plan. Therefore:

- Dependabot auto-merge is not used while `main` cannot be protected.
- `ENABLE_DEPENDABOT_AUTOMERGE` must remain absent or disabled.
- Dependency pull requests are reviewed and merged manually.
- No policy document should treat `main` as protected in the current state.

The repository may revisit branch protection and selective auto-merge if the
GitHub plan changes and required checks/reviews can be enforced. Until then,
the workflow below is retained only as a future mechanism and is not enabled.

## Selective auto-merge (future option)

The auto-merge workflow only enables GitHub auto-merge when all of these are
true: the PR is authored by Dependabot, the Dependabot metadata says patch or
minor, the dependency is declared only in `devDependencies` in the base
revision's manifest, the dependency is not `pdfjs-dist`, only package manifests
and `pnpm-lock.yaml` changed, the merge state is clean, and `lint`,
`typecheck`, `test`, and `build` all pass. `manual-review` and `do-not-merge`
always block it. Missing or ambiguous Dependabot metadata, manifest data, file
patches, checks, or merge state makes the PR ineligible. No merge is forced;
GitHub branch protection and required reviews would still apply if this future
option became available.

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

## PDF.js S0 remediation

`pdfjs-dist` remains excluded from automatic update groups and requires a
focused pull request, full validation, and a PDF smoke test. The migration from
`5.7.284` to `6.2.108` was completed as the S0 security remediation in merge
`be0b01f8d7a53cadeb7d6b05ca7ae308022487e0`.

The remediation addressed `GHSA-hq66-cqwq-w95j` / `CVE-2026-16633`, and
Dependabot alerts #94 and #97 are fixed. The PDF plugin uses PDF.js to obtain
operator lists for CAD geometry extraction; it does not create an
`AnnotationLayer` or call `getAnnotations`. Embedded PDF JavaScript is
therefore not handed to a browser execution surface by this code path.

PDF.js 6's worker is resolved as an ESM asset through Vite's `?url` handling.
Future `pdfjs-dist` updates still require focused API/worker review and a PDF
smoke test.

## Coupled MLightCAD dependencies

Packages in the MLightCAD family that are tightly coupled must be validated as
a set. Version labels such as patch or minor do not establish compatibility.

The failed PR #15 demonstrated that
`@mlightcad/dxf-json-converter@1.12.0` is not compatible with
`@mlightcad/data-model@1.10.3` in this workspace. When Dependabot groups
MLightCAD packages, the complete build is mandatory before merge. If the
versions are incompatible, separate the group and resolve the compatibility
as a dedicated migration; do not patch functional code merely to accommodate
an incompatible dependency set.

## Security dependency workflow

Security dependency work is phase-governed:

- **S0:** high-severity runtime vulnerabilities with confirmed exposure.
- **S1:** controlled batches of low-risk patch/minor security updates.
- **S2:** major upgrades and dedicated migrations.
- **S3:** documented temporary acceptances when no patch exists or exposure is
  low.

S0 is complete for PDF.js. S1 was completed as merge
`daa7e40d2387aa628503008a18429307224e552c`, updating the controlled
transitive dependency set `axios` `1.16.0` to `1.18.0`, `postcss` `8.5.10` to
`8.5.23`, `immutable` `5.1.5` to `5.1.8`, `brace-expansion` `5.0.6` to
`5.0.9`, `fast-uri` `3.1.2` to `3.1.5`, `svgo` `3.3.3` to `3.3.4`,
`linkify-it` `5.0.1` to `5.0.2`, and `dompurify` `3.4.11` to `3.4.12`.
There are now 6 Dependabot alerts open. The remaining alerts concern
`@ai-sdk/provider-utils`, `js-yaml`, and Nx; they remain outside S1 and are
reserved for later dedicated triage or migration work.

## Future GitHub setup

If the GitHub plan changes, protect `main` and require the `lint`, `typecheck`,
`test`, and `build` checks before merging. Only then may the repository consider
enabling “Allow auto-merge” and setting
`ENABLE_DEPENDABOT_AUTOMERGE=true` after an explicit policy decision. Do not
grant Dependabot or workflows blanket bypass permissions, and do not add
secrets to these workflows. The current checkout has `test/mocks/three`
fixtures restored from upstream, and `jest.config.ts` maps to them. The agent
plugin also has no bounded standalone typecheck target; its existing build
remains covered by the build gate, while `typecheck` runs the available
`tsc`/`vue-tsc` checks for the other workspaces.
