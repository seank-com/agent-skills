import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
const directory = process.cwd();
const selectedHost = process.env.TEST_PI_HOST!;
const [{ DefaultPackageManager }, { SettingsManager }, { loadSkills, formatSkillsForPrompt }, { buildSystemPrompt }] = await Promise.all([
  "core/package-manager.js", "core/settings-manager.js", "core/skills.js", "core/system-prompt.js",
].map(path => import(pathToFileURL(join(selectedHost, "dist", path)).href)));
for (const [profile, name, filters] of [
  ["empty", "@seank/agent-skills", undefined],
  ["alpha", "@fixture/agent-skills", ["!**", "+skills/fixture-alpha"]],
  ["beta", "@fixture/agent-skills", ["!**", "+skills/fixture-beta"]],
] as const) {
  const agentDir = join(directory, profile);
  const packageRoot = join(agentDir, "npm/node_modules", name);
  const version = name === "@seank/agent-skills" ? "0.1.0" : "0.0.0";
  const settingsManager = SettingsManager.inMemory({ packages: [{ source: `npm:${name}@${version}`, ...(filters ? { skills: [...filters] } : {}) }] }, { projectTrusted: true });
  const manager = new DefaultPackageManager({ cwd: directory, agentDir, settingsManager });
  const resolved = await manager.resolve(async () => "error"); // Unexpected network installs are forbidden in this fixture.
  assert.deepEqual(resolved.extensions, []); assert.deepEqual(resolved.prompts, []); assert.deepEqual(resolved.themes, []);
  const enabled = resolved.skills.filter((entry: any) => entry.enabled);
  const expectedName = profile === "empty" ? undefined : `fixture-${profile}`;
  assert.deepEqual(enabled.map((entry: any) => relative(packageRoot, entry.path)), expectedName ? [`skills/${expectedName}/SKILL.md`] : []);
  assert.equal(existsSync(join(agentDir, "skills")), false, "no loose profile skill copies");
  assert.equal(existsSync(join(packageRoot, "node_modules")), false, "no bundled or installed runtime dependencies");
  assert.equal(existsSync(join(packageRoot, "tests")), false);
  const loaded = loadSkills({ cwd: directory, agentDir, skillPaths: enabled.map((entry: any) => entry.path), includeDefaults: false });
  assert.deepEqual(loaded.diagnostics, []); assert.deepEqual(loaded.skills.map((skill: any) => skill.name), expectedName ? [expectedName] : []);
  if (!expectedName) continue;
  const skill = loaded.skills[0]; assert.ok(enabled.every((entry: any) => entry.metadata.baseDir === packageRoot));
  const prompt = buildSystemPrompt({ customPrompt: "Packed metadata boundary", selectedTools: ["read"], cwd: directory, skills: loaded.skills });
  const metadata = formatSkillsForPrompt(loaded.skills, "read").trim(); assert.ok(prompt.includes(metadata));
  for (const token of [`BODY_${expectedName}`, `REFERENCE_${expectedName}`, `ASSET_${expectedName}`, "fixture-gamma"]) assert.equal(prompt.includes(token), false);
  const skillRoot = dirname(skill.filePath);
  const body = await readFile(skill.filePath, "utf8");
  const paths = [...body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
  assert.deepEqual(paths, ["references/details.md", "scripts/check.sh", "assets/sample.txt"]);
  for (const resource of paths) assert.equal((await stat(join(skillRoot, resource))).isFile(), true);
  assert.match(await readFile(join(skillRoot, paths[0]), "utf8"), new RegExp(`REFERENCE_${expectedName}`));
  assert.equal(execFileSync("bash", [join(skillRoot, paths[1])], { cwd: directory, encoding: "utf8", timeout: 5000 }), `ASSET_${expectedName}\n`);
}
