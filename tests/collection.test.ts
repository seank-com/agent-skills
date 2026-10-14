import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { validateCollection } from "../scripts/validate.ts";
import { collectionFixture, root, temporary } from "./helpers.ts";

test("collection is guarded, empty and declares only skills", async () => {
  const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(manifest.name, "@seank/agent-skills"); assert.equal(manifest.private, true);
  assert.equal(manifest.dependencies, undefined); assert.equal(manifest.peerDependencies, undefined);
  assert.deepEqual(manifest.pi, { skills: ["./skills"] }); assert.deepEqual(await validateCollection(root), []);
});
test("reviewed layout validates metadata, catalog and local resources", async t => {
  const directory = await temporary(t); await collectionFixture(directory);
  assert.deepEqual(await validateCollection(directory), ["fixture-alpha", "fixture-beta"]);
});
test("invalid metadata and missing catalog or referenced resource fail validation", async t => {
  for (const mutation of ["metadata", "catalog", "reference", "duplicate", "directory"]) {
    const directory = await temporary(t); await collectionFixture(directory);
    const skill = join(directory, "skills/fixture-alpha/SKILL.md");
    const original = await readFile(skill, "utf8");
    if (mutation === "metadata") await writeFile(skill, original.replace("name: fixture-alpha", "name: another-name"));
    if (mutation === "catalog") await writeFile(join(directory, "README.md"), "No entries\n");
    if (mutation === "reference") await writeFile(skill, original.replace("references/details.md", "references/missing.md"));
    if (mutation === "duplicate") await writeFile(skill, original.replace("name: fixture-alpha", "name: fixture-alpha\nname: another"));
    if (mutation === "directory") await mkdir(join(directory, "skills/Invalid--Name"));
    await assert.rejects(validateCollection(directory));
  }
});
test("loose root Markdown and an unguarded empty package fail validation", async t => {
  const directory = await temporary(t); await mkdir(join(directory, "skills"));
  await writeFile(join(directory, "README.md"), "Empty catalog\n");
  const manifest = { pi: { skills: ["./skills"] }, private: false };
  await writeFile(join(directory, "package.json"), JSON.stringify(manifest));
  await assert.rejects(validateCollection(directory), /Empty collection must remain private/);
  manifest.private = true; await writeFile(join(directory, "package.json"), JSON.stringify(manifest));
  await writeFile(join(directory, "skills/README.md"), "This must not be discovered as a skill\n");
  await assert.rejects(validateCollection(directory), /loose files/);
});
