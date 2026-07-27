import { parseDocument, isAlias, visit as visitYaml } from "yaml";
import { assertBlog, BlogValidationError } from "./errors.mjs";
import { validateFrontmatter } from "./schema.mjs";

function parseYamlFrontmatter(source, sourceName) {
  const document = parseDocument(source, {
    schema: "core",
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new BlogValidationError(
      document.errors.map((error) => error.message).join("; "),
      sourceName,
    );
  }
  if (document.warnings.length > 0) {
    throw new BlogValidationError(
      document.warnings.map((warning) => warning.message).join("; "),
      sourceName,
    );
  }

  let forbiddenAlias;
  visitYaml(document, (_key, node) => {
    if (!forbiddenAlias && (isAlias(node) || node?.anchor)) forbiddenAlias = node;
  });
  assertBlog(!forbiddenAlias, "YAML anchors and aliases are not allowed", sourceName);

  let value;
  try {
    value = document.toJS({ maxAliasCount: 0, mapAsMap: false });
  } catch (error) {
    throw new BlogValidationError(
      `could not convert YAML frontmatter (${error instanceof Error ? error.message : String(error)})`,
      sourceName,
    );
  }

  assertBlog(
    value !== null && typeof value === "object" && !Array.isArray(value),
    "frontmatter must be a YAML object",
    sourceName,
  );
  return validateFrontmatter(value, sourceName);
}

export function splitArticleSource(input, sourceName) {
  const normalized = input.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");
  assertBlog(lines[0] === "---", "must begin with YAML frontmatter", sourceName);

  const closingIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  assertBlog(closingIndex !== -1, "frontmatter is missing its closing --- line", sourceName);
  assertBlog(closingIndex > 1, "frontmatter must not be empty", sourceName);

  const frontmatterSource = lines.slice(1, closingIndex).join("\n");
  const body = lines.slice(closingIndex + 1).join("\n").trim();
  assertBlog(body.length > 0, "Markdown body must not be empty", sourceName);

  return {
    frontmatter: parseYamlFrontmatter(frontmatterSource, sourceName),
    body,
  };
}
