import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { addSkill, collectionFixture, host, root, temporary } from "./helpers.ts";

test("actual guarded tarball and synthetic installed selection fixture use real Pi discovery", { timeout: 60_000 }, async t => {
  const directory = await temporary(t);
  const env = { ...process.env, npm_config_cache: join(directory, "npm-cache"), HOME: join(directory, "home"), PI_CODING_AGENT_DIR: join(directory, "unused-profile") };
  await mkdir(env.HOME);
  const pack = (cwd: string, destination: string) => JSON.parse(execFileSync("npm", ["pack", "--json", "--pack-destination", destination], { cwd, env, encoding: "utf8", timeout: 15_000 }))[0];
  const actual = pack(root, directory);
  assert.deepEqual(actual.files.map((file: { path: string }) => file.path).sort(), ["LICENSE", "README.md", "docs/conventions.md", "docs/selection.md", "package.json"]);
  assert.deepEqual(actual.bundled, []);
  const fixture = join(directory, "fixture"); await collectionFixture(fixture); await addSkill(fixture, "fixture-gamma");
  await mkdir(join(fixture, "tests")); await writeFile(join(fixture, "tests/private-canary.txt"), "SYNTHETIC_EXCLUDED_CANARY\n");
  const synthetic = pack(fixture, directory);
  assert.equal(synthetic.files.some((file: { path: string }) => file.path.startsWith("tests/")), false);
  for (const name of ["fixture-alpha", "fixture-beta", "fixture-gamma"]) {
    for (const resource of ["SKILL.md", "references/details.md", "scripts/check.sh", "assets/sample.txt"]) assert.ok(synthetic.files.some((file: { path: string }) => file.path === `skills/${name}/${resource}`));
  }
  for (const [profile, tarball] of [["empty", actual.filename], ["alpha", synthetic.filename], ["beta", synthetic.filename]]) {
    const prefix = join(directory, profile, "npm"); await mkdir(prefix, { recursive: true });
    await writeFile(join(prefix, "package.json"), JSON.stringify({ private: true }));
    execFileSync("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", prefix, join(directory, tarball)], { cwd: directory, env, stdio: "pipe", timeout: 15_000 });
  }
  assert.equal(JSON.parse(await readFile(join(directory, "empty/npm/node_modules/@seank/agent-skills/package.json"), "utf8")).private, true);
  await writeFile(join(directory, "probe.ts"), await readFile(new URL("./packed-probe.ts", import.meta.url), "utf8"));
  execFileSync(process.execPath, [join(directory, "probe.ts")], { cwd: directory, env: { ...env, TEST_PI_HOST: host }, stdio: "pipe", timeout: 15_000 });
});
