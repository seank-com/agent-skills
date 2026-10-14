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
