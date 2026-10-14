# Selective discovery

Pi's manifest declares the collection root via pi.skills. Resource filters narrow
that manifest; they cannot expose undeclared resources. Omitting a resource
filter enables everything the package allows; an empty skills array enables none.
A +path entry force-includes an exact skill directory or SKILL.md path, but alone
it does not exclude other entries. Start the skills filter with !** and then add
one exact +path for each approved catalog entry. Avoid broad globs if upgrades
must not enable new content. Use pi config to review selected resources locally.

The catalog has no released entries, so there are no consumer installation or
skill-selection commands to run yet. After release, substitute actual catalog
names for explicit package-relative paths. Never treat synthetic test names as
available skills. Private assembly pins an exact collection version and explicitly
enumerates only reviewed skill directories; changing one assembly's selection
must not affect the other.

Tests exercise the selected Pi 0.87.1 host's actual package manager, skills loader
and system-prompt construction. With two synthetic skills, selection enables one;
adding a third does not expand it. Independent disposable profiles select different
skills. A missing exact path enables none; a manifest limits all selection.
References and SKILL.md instructions are not eagerly injected into the prompt.
Installed references/scripts/assets resolve relative to the selected skill entry,
including when the process cwd differs. Live profiles and private content are not
fixtures. The actual empty collection tarball has no discovered skills.

On these tested hosts, npm-managed packages reside in the selected profile's npm
package tree; they do not require loose skill copies or symlinks under profile
skills/. Packed tests use an offline local npm prefix and the real package-manager
resolution path. Ordinary real installation, publication and deployment remain
separately authorized operator actions.

[Vercel skills](https://github.com/vercel-labs/skills) offers --list and --skill
selection as an additional user route after real content exists. It is not the
private kit deployment mechanism. Its installer/network behavior was not tested;
no empty package or synthetic skill has been published.
