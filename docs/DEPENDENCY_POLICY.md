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

`@changesets/cli` is currently declared, but no `.changeset` configuration or
active release workflow usage was found. It was nevertheless reviewed and
updated as an independent tooling dependency in PR #26; it is not currently
deferred, and this policy does not imply that a release workflow exists.

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

PR #15 was closed as obsolete/deferred after review. It mixed independent
tooling with the coupled MLightCAD family and was based on an older main
revision. The tooling-only replacement was merged as PR #26 in merge
`aa9a2f77265610b44c020ef8a0752cf26b0ccbaa`.

The MLightCAD set from #15 remains deferred. Published package metadata shows
that `@mlightcad/dxf-json-converter@1.12.0` and
`@mlightcad/libredwg-converter@3.12.0` require the exact
`@mlightcad/data-model@1.12.0` peer train, while the current upstream uses
`@mlightcad/data-model@1.12.3` and `@mlightcad/libredwg-converter@3.12.3`
with the built-in `AcDbNativeDxfConverter` rather than the deprecated
`dxf-json-converter`. Adopting that direction requires a focused API and
converter-path migration; it must not be introduced as a generic Dependabot
group or by changing viewer code solely to make versions compile.

Independent development updates from #15 were reviewed and merged separately
in #26: Changesets CLI, TypeScript-ESLint, Prettier, ts-jest, TypeDoc, fflate,
Sass, vue-eslint-parser, and Playwright. Future Dependabot groups must exclude
the MLightCAD family from generic tooling groups.

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
The three `js-yaml` alerts were subsequently remediated in merge
`8d0dcb3d456a28ee03ebac6bc07b0cbcc13a5246`, updating the explicit overrides
`js-yaml@3` from `3.15.0` to `3.15.1` and `js-yaml@4` from `4.2.0` to
`4.3.1`. Dependabot alerts #96, #95, and #85 are fixed. The change remained
limited to tooling/dev dependency resolution; no runtime code was changed.

Nx S2B was completed in two focused merges. Merge
`bc17a5a73b083f42163813fce8e5da923a8ac8a3` migrated `nx` and `@nx/js` from
`20.0.4` to `22.7.2` using the official Nx migration flow; merge
`868254cdfd6d0f945de83b7911d6990d0b28e356` applied the follow-up patch from
`22.7.2` to `22.7.7`. The changes required only the Nx manifests and lockfile;
no functional code or workflow changes were needed. Dependabot alerts #87,
#88, #98, and #100 are fixed. The same follow-up removed vulnerable transitive
`yaml@2.8.0` from the Nx dependency path; Nx now resolves `yaml@2.9.0`, above
the fixed `2.8.3` release. Dependabot alert #99 is fixed.

One alert remains open: `@ai-sdk/provider-utils` (#51), which remains an S3
temporary acceptance while no patched version is available. No immediate
security remediations are currently known outside the AI SDK alert. No further
S1 work should include Nx or the AI SDK.

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
