import assert from "node:assert/strict";
import test from "node:test";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { addSkill, collectionFixture, importHost, resolveSelection, root, temporary } from "./helpers.ts";
const selected = (result: any) => result.skills.filter((entry: any) => entry.enabled).map((entry: any) => entry.path);

test("real Pi discovers no public skills in the foundation", async t => {
  const directory = await temporary(t); const resolved = await resolveSelection(root, join(directory, "profile"));
  assert.deepEqual(resolved.skills, []); assert.deepEqual(resolved.extensions, []); assert.deepEqual(resolved.prompts, []); assert.deepEqual(resolved.themes, []);
});
test("exact selection stays fixed after an upstream addition and isolates two assemblies", async t => {
  const directory = await temporary(t); await collectionFixture(directory);
  const all = await resolveSelection(directory, join(directory, "all")); assert.equal(selected(all).length, 2);
  // A force-include alone is not selective; preserve this important host behavior.
  const broad = await resolveSelection(directory, join(directory, "broad"), ["+skills/fixture-alpha"]); assert.equal(selected(broad).length, 2);
  const before = selected(await resolveSelection(directory, join(directory, "before"), ["!**", "+skills/fixture-alpha"]));
  assert.equal(before.length, 1);
  await addSkill(directory, "fixture-gamma");
  for (const name of ["fixture-alpha", "fixture-beta"]) {
    const resolved = await resolveSelection(directory, join(directory, name), ["!**", `+skills/${name}`]);
    if (name === "fixture-alpha") assert.deepEqual(selected(resolved), before);
    assert.deepEqual(selected(resolved).map((path: string) => relative(directory, path)), [`skills/${name}/SKILL.md`]);
    assert.deepEqual(resolved.extensions, []); assert.deepEqual(resolved.prompts, []); assert.deepEqual(resolved.themes, []);
  }
});
test("empty, missing and manifest-disallowed selections do not broaden discovery", async t => {
  const directory = await temporary(t); await collectionFixture(directory);
  for (const filters of [[], ["!**", "+skills/missing"]]) assert.deepEqual(selected(await resolveSelection(directory, join(directory, "none"), filters)), []);
  const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8")); manifest.pi.skills = ["./skills/fixture-alpha"];
  await writeFile(join(directory, "package.json"), JSON.stringify(manifest));
  assert.deepEqual(selected(await resolveSelection(directory, join(directory, "restricted"), ["!**", "+skills/fixture-beta"])), []);
});
test("actual prompt construction advertises metadata without skill bodies or resources", async t => {
  const directory = await temporary(t); await collectionFixture(directory);
  const resolved = await resolveSelection(directory, join(directory, "profile"), ["!**", "+skills/fixture-alpha"]);
  const [{ loadSkills, formatSkillsForPrompt }, { buildSystemPrompt }] = await Promise.all([importHost("core/skills.js"), importHost("core/system-prompt.js")]);
  const loaded = loadSkills({ cwd: directory, agentDir: join(directory, "profile"), skillPaths: selected(resolved), includeDefaults: false });
  assert.deepEqual(loaded.diagnostics, []); assert.deepEqual(loaded.skills.map((skill: any) => skill.name), ["fixture-alpha"]);
  const metadata = formatSkillsForPrompt(loaded.skills, "read").trim();
  const prompt = buildSystemPrompt({ customPrompt: "Synthetic skill boundary", selectedTools: ["read"], cwd: directory, skills: loaded.skills });
  assert.ok(prompt.includes(metadata)); assert.equal(prompt.split(metadata).length - 1, 1);
  for (const sentinel of ["BODY_fixture-alpha", "REFERENCE_fixture-alpha", "ASSET_fixture-alpha", "fixture-beta"]) assert.equal(prompt.includes(sentinel), false);
  const skillRoot = join(directory, "skills/fixture-alpha"); assert.match(await readFile(join(skillRoot, "references/details.md"), "utf8"), /REFERENCE_fixture-alpha/);
});
