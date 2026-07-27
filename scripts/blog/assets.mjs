import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requestFilename(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, "http://blog-assets.local").pathname);
  } catch {
    return undefined;
  }

  const filename = pathname.replace(/^\/+/, "");
  if (
    !filename ||
    filename !== basename(filename) ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return undefined;
  }
  if (!CONTENT_TYPES.has(extname(filename).toLowerCase())) return undefined;
  return filename;
}

export async function readGeneratedBlogAsset(requestUrl, assetsDirectory) {
  const filename = requestFilename(requestUrl);
  if (!filename) return undefined;

  const filePath = resolve(assetsDirectory, filename);
  try {
    const fileStat = await lstat(filePath);
    if (!fileStat.isFile() || fileStat.isSymbolicLink()) return undefined;
    return {
      body: await readFile(filePath),
      contentType: CONTENT_TYPES.get(extname(filename).toLowerCase()),
      filename,
    };
  } catch (error) {
    if (error?.code === "ENOENT") return undefined;
    throw error;
  }
}

export async function copyGeneratedBlogAssets(sourceDirectory, destinationDirectory) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  await rm(destinationDirectory, { recursive: true, force: true });
  await mkdir(destinationDirectory, { recursive: true });

  let copied = 0;
  for (const entry of [...entries].sort((left, right) => lexicalCompare(left.name, right.name))) {
    if (
      entry.isSymbolicLink() ||
      !entry.isFile() ||
      !CONTENT_TYPES.has(extname(entry.name).toLowerCase())
    ) {
      throw new Error(`[blog:assets] unexpected generated asset "${entry.name}"`);
    }
    await copyFile(resolve(sourceDirectory, entry.name), resolve(destinationDirectory, entry.name));
    copied += 1;
  }
  return copied;
}
