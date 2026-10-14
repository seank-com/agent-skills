import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

export async function validateCollection(root: string): Promise<string[]> {
  const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  if (JSON.stringify(manifest.pi) !== JSON.stringify({ skills: ["./skills"] })) throw new Error("Declare only the public skills root");
  const catalog = await readFile(join(root, "README.md"), "utf8");
  const names: string[] = [];
  for (const entry of await readdir(join(root, "skills"), { withFileTypes: true })) {
    if ([".gitkeep", ".npmignore"].includes(entry.name)) continue;
    if (!entry.isDirectory()) throw new Error("Keep loose files and links outside the skills root");
    const name = entry.name;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) throw new Error(`Invalid skill directory: ${name}`);
    const skillRoot = join(root, "skills", name);
    const source = await readFile(join(skillRoot, "SKILL.md"), "utf8");
    const sections = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!sections) throw new Error(`Missing frontmatter: ${name}`);
    const document = parseDocument(sections[1]);
    if (document.errors.length) throw new Error(`Invalid YAML: ${name}`);
    const metadata = document.toJS() as Record<string, unknown> | null;
    if (!metadata || metadata.name !== name || typeof metadata.description !== "string" || !metadata.description.trim() || metadata.description.length > 1024 || !sections[2].trim()) throw new Error(`Invalid name, description or body: ${name}`);
    if (metadata.compatibility !== undefined && (typeof metadata.compatibility !== "string" || !metadata.compatibility.trim() || metadata.compatibility.length > 500)) throw new Error(`Invalid compatibility: ${name}`);
    if (metadata.metadata !== undefined && (!metadata.metadata || typeof metadata.metadata !== "object" || Array.isArray(metadata.metadata) || Object.values(metadata.metadata).some(value => typeof value !== "string"))) throw new Error(`Invalid metadata: ${name}`);
    if (!catalog.includes(`skills/${name}/SKILL.md`)) throw new Error(`Missing catalog entry: ${name}`);
    for (const match of sections[2].matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
      const path = resolve(skillRoot, decodeURIComponent(target.split("#")[0]));
      const local = relative(skillRoot, path);
      if (local === ".." || local.startsWith(`..${sep}`) || !(await stat(path)).isFile()) throw new Error(`Reference must resolve inside the packaged skill: ${name}`);
    }
    names.push(name);
  }
  if (!names.length && manifest.private !== true) throw new Error("Empty collection must remain private; do not publish it");
  return names.sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const names = await validateCollection(root);
  console.log(`Validated ${names.length} public skills; plain resources require no compilation.`);
}
