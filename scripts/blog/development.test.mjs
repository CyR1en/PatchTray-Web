import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
  copyGeneratedBlogAssets,
  readGeneratedBlogAsset,
} from "./assets.mjs";
import { createBlogRegenerationQueue } from "./development.mjs";

async function workspace(t) {
  const root = await mkdtemp(resolve(tmpdir(), "patchtray-blog-development-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("serializes edits made during generation into one follow-up run", async () => {
  let calls = 0;
  let concurrent = 0;
  let maximumConcurrent = 0;
  let releaseFirst;
  let markFirstStarted;
  const firstStarted = new Promise((resolveStarted) => {
    markFirstStarted = resolveStarted;
  });
  const firstBlocked = new Promise((resolveBlocked) => {
    releaseFirst = resolveBlocked;
  });

  const queue = createBlogRegenerationQueue({
    debounceMs: 1,
    async generate() {
      calls += 1;
      concurrent += 1;
      maximumConcurrent = Math.max(maximumConcurrent, concurrent);
      if (calls === 1) {
        markFirstStarted();
        await firstBlocked;
      }
      concurrent -= 1;
      return calls;
    },
  });

  const firstFlush = queue.flush();
  await firstStarted;
  queue.schedule();
  queue.schedule();
  releaseFirst();
  await firstFlush;

  assert.equal(calls, 2);
  assert.equal(maximumConcurrent, 1);
  queue.close();
});

test("reports a failed generation and accepts the next edit", async () => {
  let attempts = 0;
  const errors = [];
  const successes = [];
  const queue = createBlogRegenerationQueue({
    async generate() {
      attempts += 1;
      if (attempts === 1) throw new Error("invalid draft");
      return "valid output";
    },
    onError(error) {
      errors.push(error.message);
    },
    onSuccess(result) {
      successes.push(result);
    },
  });

  await queue.flush();
  await queue.flush();

  assert.deepEqual(errors, ["invalid draft"]);
  assert.deepEqual(successes, ["valid output"]);
  queue.close();
});

test("copies only current generated media and reads safe development assets", async (t) => {
  const root = await workspace(t);
  const source = resolve(root, "source");
  const destination = resolve(root, "destination");
  await mkdir(source, { recursive: true });
  await mkdir(destination, { recursive: true });
  await writeFile(resolve(source, "article-image-deadbeef.webp"), Buffer.from("current"));
  await writeFile(resolve(destination, "stale-image.jpg"), Buffer.from("stale"));

  const copied = await copyGeneratedBlogAssets(source, destination);
  assert.equal(copied, 1);
  assert.equal(
    await readFile(resolve(destination, "article-image-deadbeef.webp"), "utf8"),
    "current",
  );
  await assert.rejects(() => access(resolve(destination, "stale-image.jpg")), /ENOENT/);

  const asset = await readGeneratedBlogAsset(
    "/article-image-deadbeef.webp",
    destination,
  );
  assert.equal(asset.contentType, "image/webp");
  assert.equal(asset.body.toString("utf8"), "current");
  assert.equal(
    await readGeneratedBlogAsset("/nested/article-image-deadbeef.webp", destination),
    undefined,
  );
  assert.equal(
    await readGeneratedBlogAsset("/..%2Foutside.jpg", destination),
    undefined,
  );
  assert.equal(
    await readGeneratedBlogAsset("/article-image-deadbeef.svg", destination),
    undefined,
  );
});

test("rejects unexpected generated asset entries during production copy", async (t) => {
  const root = await workspace(t);
  const source = resolve(root, "source");
  const destination = resolve(root, "destination");
  await mkdir(resolve(source, "nested"), { recursive: true });

  await assert.rejects(
    () => copyGeneratedBlogAssets(source, destination),
    /unexpected generated asset "nested"/,
  );
});
