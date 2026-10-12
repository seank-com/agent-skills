# Skill conventions

Follow the [Agent Skills specification](https://agentskills.io/specification).
Each reviewed public skill has one directory under skills/, named exactly as its
YAML frontmatter name, containing SKILL.md. Names are 1–64 lowercase letters,
numbers and hyphens, without leading/trailing or consecutive hyphens. A nonempty
description of at most 1024 characters explains purpose and when to use it.
Optional compatibility names concrete host/system/network prerequisites; license
preserves applicable attribution. Optional metadata is a string-to-string map.

SKILL.md contains YAML frontmatter followed by actionable Markdown instructions.
Keep the entry concise, generally under 500 lines; move detail to references/.
Use scripts/ only for needed Bash or TypeScript helpers and assets/ only for used
templates/resources. Resolve links and script paths relative to the skill root,
not process cwd, a sibling checkout, a live profile or a private repository.
Every referenced resource must be included in the packed package. Avoid deep
reference chains; make on-demand resources clear in the entry point.

Do not put catalog/convention Markdown at the skills root: Pi can discover loose
Markdown files there as skill entries. Catalog lives in the repository README;
collection guidance lives in docs/. Hidden directory placeholders are not shipped.
Do not create nested skill entries inside references/, scripts/ or assets/.

Discovery should expose only name/description/location metadata. The skill body
and referenced files stay on demand. Scripts must document their arguments and
prerequisites, return useful errors, and use explicit paths. A skill does not gain
permission to publish, spend money or change a live runtime through its text.

Before adding public content, review scope, examples, links, attribution and
supporting files for publication. Do not copy private skill/history/identity
content or credentials. Add an actual catalog row with purpose, trigger,
prerequisites, supported hosts and license, and test installed reference paths.
The catalog is intentionally empty today; no filler skill belongs under skills/.

The private:true manifest guard remains while no public skill exists. Remove it
only in a separately authorized real release with reviewed contents. Default
unit/packed fixtures stay outside skills/ and are never catalog entries or shipped
resources. npm pack is a local validation action, not publication.
