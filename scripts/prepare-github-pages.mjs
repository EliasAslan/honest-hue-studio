import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = join(process.cwd(), ".output", "public");
const assetsDir = join(publicDir, "assets");
const siteBasePath = "/honest-hue-studio";

await mkdir(publicDir, { recursive: true });

const shellPath = join(publicDir, "_shell.html");
const shell = await readFile(shellPath, "utf8");
const html = shell
  .replaceAll("/assets/", `${siteBasePath}/assets/`)
  .replaceAll('href="/favicon.ico"', `href="${siteBasePath}/favicon.ico"`);

await Promise.all([
  writeFile(join(publicDir, "index.html"), html),
  writeFile(join(publicDir, "404.html"), html),
]);

for (const fileName of await readdir(assetsDir)) {
  if (!fileName.endsWith(".js")) continue;

  const filePath = join(assetsDir, fileName);
  const source = await readFile(filePath, "utf8");
  const normalized = source
    .replaceAll("/assets/", `${siteBasePath}/assets/`)
    .replace(/(?<![./])assets\//g, `${siteBasePath}/assets/`);

  if (normalized !== source) {
    await writeFile(filePath, normalized);
  }
}
