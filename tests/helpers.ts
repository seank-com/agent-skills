import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { TestContext } from "node:test";

export const root = fileURLToPath(new URL("../", import.meta.url));
export const host = process.env.PI_CODING_AGENT_PACKAGE ?? join(root, "node_modules/@earendil-works/pi-coding-agent");
export function importHost(path: string): Promise<any> { return import(pathToFileURL(join(host, "dist", path)).href); }
export async function temporary(t: TestContext): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "agent-skills-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
export async function addSkill(directory: string, name: string): Promise<void> {
  const skill = join(directory, "skills", name);
  await Promise.all(["references", "scripts", "assets"].map(child => mkdir(join(skill, child), { recursive: true })));
  await writeFile(join(skill, "SKILL.md"), `---\nname: ${name}\ndescription: Synthetic selection fixture ${name}. Use only in disposable tests.\nlicense: MIT\n---\n\nBODY_${name}_ON_DEMAND\n\nRead [details](references/details.md), run [check](scripts/check.sh) using Bash, and use [asset](assets/sample.txt).\n`);
  await writeFile(join(skill, "references/details.md"), `REFERENCE_${name}_ON_DEMAND\n`);
  await writeFile(join(skill, "scripts/check.sh"), '#!/usr/bin/env bash\nset -eu\nscript_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"\ncat "$script_directory/../assets/sample.txt"\n', { mode: 0o755 });
  await writeFile(join(skill, "assets/sample.txt"), `ASSET_${name}\n`);
}
export async function collectionFixture(directory: string): Promise<void> {
  await mkdir(join(directory, "skills"), { recursive: true });
  await writeFile(join(directory, "package.json"), JSON.stringify({ name: "@fixture/agent-skills", version: "0.0.0", private: true, type: "module", files: ["skills", "README.md", "LICENSE"], pi: { skills: ["./skills"] } }));
  await writeFile(join(directory, "README.md"), "Synthetic test catalog: [alpha](skills/fixture-alpha/SKILL.md), [beta](skills/fixture-beta/SKILL.md).\n");
  await writeFile(join(directory, "LICENSE"), "MIT: synthetic test resources.\n");
  await addSkill(directory, "fixture-alpha"); await addSkill(directory, "fixture-beta");
}
export async function resolveSelection(directory: string, profile: string, skills?: string[]) {
  const [{ DefaultPackageManager }, { SettingsManager }] = await Promise.all([importHost("core/package-manager.js"), importHost("core/settings-manager.js")]);
  await mkdir(profile, { recursive: true });
  const settingsManager = SettingsManager.inMemory({ packages: [{ source: directory, ...(skills === undefined ? {} : { skills }), extensions: [], prompts: [], themes: [] }] }, { projectTrusted: true });
  return new DefaultPackageManager({ cwd: directory, agentDir: profile, settingsManager }).resolve();
}
