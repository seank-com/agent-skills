# agent-skills
A collection of skills for agents

## Catalog

No public skills are currently available or released. The collection foundation
is complete; `package.json` deliberately has `private: true` to prevent an empty
npm release. Version 0.1.0 is planned metadata, not a published version.
Private identity/personality skills remain in the private runtime kit and are not
catalog entries. Test-only skills are synthetic and never included in this package.

Future catalog entries must list the actual reviewed skill name, purpose, when
to use it, prerequisites, supported hosts and license. No placeholder skills are
provided to fill the catalog. See [conventions](docs/conventions.md).

## Selection and prerequisites

This package declares only `pi.skills: ["./skills"]`. It installs no Pi runtime
or public extension dependency. The development tests pin stock Pi 0.87.1 and
also accept an explicitly selected existing patched 0.87.1 artifact; other host
versions are unverified. Each future skill documents its own runtime requirements.

Choose actual released catalog entries through Pi's `pi config` or explicit
package resource filters. Exact selective filters must exclude all skills before
force-including each approved path. Installing a newer collection must not enable
new skills. Private assemblies enumerate selected skill directories explicitly.
See [selection](docs/selection.md) for the tested host behavior and release limits.
No installation examples name an unreleased skill.

After reviewed public content is available, Vercel's additional discovery route
is `npx skills add seank-com/agent-skills --list`; selection uses its `--skill`
option with an actual catalog name. This is a separate user installation route,
not the private kit's prod/test deployment mechanism. No installer was run here.

## Development

```bash
npm ci
npm run check
npm test
npm run build
npm pack --dry-run
npm run test:package
```

Node 24.14.1+ is required for these TypeScript engineering scripts. Build validates
plain skill resources and produces no compiled runtime. The packed test installs
the actual collection tarball offline in a disposable consumer, proves zero
skills are discovered, and separately packs synthetic selection fixtures to test
real Pi filtering, lazy metadata and skill-relative reference/script/asset paths.
Fixtures, engineering scripts, dependencies and checkout state do not ship.

Public README/MIT history is preserved. A real skill release requires reviewed
content, catalog updates, content/package validation and publication authorization.
