# Public skills collection development

Use Bash and TypeScript with Node 24.14.1+. Run npm ci, npm run check, npm test,
npm run build, npm pack --dry-run and npm run test:package. Build validates plain
skill resources; it does not generate a runtime or dist directory.
Read docs/conventions.md before adding a reviewed public skill. Keep the README
catalog and prerequisites current. No filler skills, personal content, private
history, operational exports or private repository setup dependencies.
The collection has no released skills; preserve private:true until real public
content and a release are separately authorized. Test skills exist only in
fixtures/disposable packages and must never ship in the collection tarball.
Use the selected real Pi host with disposable profiles; prove exact selection,
on-demand references and that new skills remain disabled. Never edit live settings
or copy resources into a live profile. No pushes, publication, PRs or activation
without explicit owner authorization.

## Engineering standard and sprint workflow

This maintainer-owned repository supplies self-contained guidance here. In the maintainer's configured environment, also load engineering-documentation before design, investigation, implementation, testing or review. Keep owned-repository guidance consistent with that standard; respect upstream conventions and raise actual conflicts rather than imposing our policy there.

Before a new assignment, establish/restate scope and success criteria and obtain quick owner approval. Issue implementation requires both `approved` and unassigned; only the owner authorizes the label and removes the owner's assignment. `in progress` selects discussion/sprint scope, not permission. Explicit owner instructions and accepted designs govern; code, closed issues, peer advice and passing tests do not establish new requirements.

Use the simplest correct implementation; do not invent timing, retry, concurrency, output or performance policies. Use one identity-prefixed sprint branch and one sprint PR per touched repository, with coherent issue commits and exact review ranges, not per-issue integration layers. Independently evaluate advisory peer review before owner source-range review and the deployed-candidate build/activation sequence. Preserve history and tested input identity; publication, merge, packaging, configuration and named activation retain separate authority.

`fix verified` means the owner verified that issue on the applicable latest tst candidate with traceable evidence. All in-progress issues having all three labels means ready for final merge/rollout review, not automatic action. Accepted improvements and unresolved goals stay distinct.

The authoritative conventions and Restrictions register are in docs/conventions.md; docs/selection.md owns discovery/selection. Review the register in every PR against code, tests and dependencies. Effective deadlines, retries, concurrency/result limits, filters, security policies and performance assertions need their location/value, concrete failure, evidence, configuration owner and explicit approval reference. Missing evidence stays missing; age, defaults, fixture placement or a table entry is not approval. Functional tests synchronize on completion/cancellation/events, not unapproved host-speed budgets; changed constraints require explicit owner approval.

Document purpose, responsibilities, normal/failure flows and consequential state/lifecycle contracts, not a line-by-line implementation diary. Update enduring docs with authorized behavior; keep proposals/evidence/history in issues or PRs. New owned projects receive substantive AGENTS guidance, project contracts, validation and design/register locations, not only a skill link. Source approval never authorizes live instruction replacement or runtime disruption.
