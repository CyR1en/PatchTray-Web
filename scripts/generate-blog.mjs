import { resolve } from "node:path";
import { generateBlog } from "./blog/generator.mjs";
import { errorMessage } from "./blog/errors.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const argumentsList = process.argv.slice(2);
const unknownArguments = argumentsList.filter(
  (argument) => argument !== "--include-drafts",
);
if (unknownArguments.length > 0) {
  console.error(
    `[blog:generate] unknown argument ${unknownArguments[0]}`,
  );
  process.exitCode = 1;
} else {
  const includeDrafts = argumentsList.includes("--include-drafts");

  try {
    const result = await generateBlog({
      includeDrafts,
      outputDirectory: resolve(projectRoot, ".generated", "blog"),
      postsDirectory: resolve(projectRoot, "content", "blog", "posts"),
    });
    const previewSummary = includeDrafts
      ? `; previewing ${result.previewCount} draft`
      : "";
    console.log(
      `[blog:generate] ${result.publishedCount} published, ${result.draftCount} draft${previewSummary}; digest ${result.contentDigest.slice(0, 12)}`,
    );
  } catch (error) {
    console.error(`[blog:generate] ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}
