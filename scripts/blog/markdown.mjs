import { slug as githubSlug } from "github-slugger";
import { toString as markdownText } from "mdast-util-to-string";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import {
  CANONICAL_ORIGIN,
  FIXED_SITE_PATHS,
  MAX_AST_DEPTH,
  MAX_AST_NODES,
  READING_WORDS_PER_MINUTE,
} from "./config.mjs";
import { assertBlog, BlogValidationError } from "./errors.mjs";

const ALLOWED_MARKDOWN_NODES = new Set([
  "blockquote",
  "break",
  "code",
  "definition",
  "delete",
  "emphasis",
  "heading",
  "image",
  "imageReference",
  "inlineCode",
  "link",
  "linkReference",
  "list",
  "listItem",
  "paragraph",
  "root",
  "strong",
  "table",
  "tableCell",
  "tableRow",
  "text",
  "thematicBreak",
]);

const SANITIZE_SCHEMA = {
  strip: ["script"],
  clobberPrefix: "",
  tagNames: [
    "a",
    "blockquote",
    "br",
    "code",
    "del",
    "em",
    "h2",
    "h3",
    "h4",
    "hr",
    "img",
    "input",
    "li",
    "ol",
    "p",
    "picture",
    "pre",
    "source",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "ul",
  ],
  attributes: {
    a: ["href"],
    code: [["className", /^language-/, "hljs", /^hljs-/]],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    img: [
      "alt",
      "decoding",
      "height",
      "loading",
      "sizes",
      "src",
      "srcSet",
      "width",
    ],
    input: ["checked", "disabled", ["type", "checkbox"]],
    li: [["className", "task-list-item"]],
    source: ["sizes", "srcSet", "type"],
    span: [["className", /^hljs-/]],
    td: ["align"],
    th: ["align"],
    ul: [["className", "contains-task-list"]],
  },
  protocols: {
    href: ["https", "mailto"],
    src: ["https"],
  },
};

function countTree(node, depth, state, sourceName) {
  assertBlog(depth <= MAX_AST_DEPTH, `Markdown nesting exceeds ${MAX_AST_DEPTH} levels`, sourceName);
  state.count += 1;
  assertBlog(state.count <= MAX_AST_NODES, `Markdown exceeds ${MAX_AST_NODES} AST nodes`, sourceName);
  if (Array.isArray(node.children)) {
    for (const child of node.children) countTree(child, depth + 1, state, sourceName);
  }
}

function normalizeDefinitionIdentifier(identifier) {
  return identifier.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function validateImageReference(url, alt, sourceName) {
  assertBlog(
    url.startsWith("./") &&
      url.length > 2 &&
      !url.slice(2).includes("/") &&
      !url.includes("\\") &&
      !url.includes("?") &&
      !url.includes("#") &&
      !url.includes("%") &&
      !url.includes("\0"),
    `image "${url}" must be a local filename prefixed with ./`,
    sourceName,
  );
  const cleanAlt = alt.trim();
  assertBlog(cleanAlt === alt, `image "${url}" alt text must not have surrounding whitespace`, sourceName);
  assertBlog(
    [...cleanAlt].length >= 10 && [...cleanAlt].length <= 240,
    `image "${url}" alt text must be between 10 and 240 characters`,
    sourceName,
  );
}

function headingId(heading, sourceName, seenHeadingSlugs) {
  const text = markdownText(heading).trim();
  assertBlog(text.length > 0, "headings must contain visible text", sourceName);
  const baseSlug = githubSlug(text);
  assertBlog(baseSlug.length > 0, `heading "${text}" cannot produce an empty anchor`, sourceName);
  assertBlog(
    !seenHeadingSlugs.has(baseSlug),
    `heading "${text}" produces a duplicate anchor`,
    sourceName,
  );
  seenHeadingSlugs.add(baseSlug);
  return { text, baseSlug, id: `section-${baseSlug}` };
}

export function analyzeMarkdown(body, sourceName) {
  const parser = unified().use(remarkParse).use(remarkGfm);
  const tree = parser.parse(body);
  countTree(tree, 0, { count: 0 }, sourceName);

  const seenHeadingSlugs = new Set();
  const headings = [];
  const definitions = new Map();
  const pendingReferences = [];
  const links = [];
  const images = [];

  visit(tree, (node) => {
    assertBlog(
      ALLOWED_MARKDOWN_NODES.has(node.type),
      `unsupported Markdown node "${node.type}"`,
      sourceName,
    );

    if (node.type === "heading") {
      assertBlog(node.depth >= 2 && node.depth <= 4, "body headings must be H2 through H4", sourceName);
      const heading = headingId(node, sourceName, seenHeadingSlugs);
      node.data = {
        ...node.data,
        hProperties: { ...(node.data?.hProperties ?? {}), id: heading.id },
      };
      headings.push({ depth: node.depth, ...heading });
    }

    if (node.type === "code") {
      assertBlog(!node.meta, "fenced code blocks may specify a language but not metadata", sourceName);
      if (node.lang) {
        assertBlog(
          /^[A-Za-z0-9_+#.-]{1,40}$/.test(node.lang),
          `invalid fenced code language "${node.lang}"`,
          sourceName,
        );
      }
    }

    if (node.type === "definition") {
      const identifier = normalizeDefinitionIdentifier(node.identifier);
      assertBlog(!definitions.has(identifier), `duplicate link definition "${node.identifier}"`, sourceName);
      definitions.set(identifier, node);
    }

    if (node.type === "link") {
      links.push({ node, url: node.url, label: markdownText(node).trim() });
    }

    if (node.type === "image") {
      validateImageReference(node.url, node.alt ?? "", sourceName);
      images.push({ node, url: node.url, alt: node.alt ?? "" });
    }

    if (node.type === "linkReference" || node.type === "imageReference") {
      pendingReferences.push(node);
    }
  });

  for (const reference of pendingReferences) {
    const identifier = normalizeDefinitionIdentifier(reference.identifier);
    const definition = definitions.get(identifier);
    assertBlog(definition, `reference "${reference.identifier}" has no definition`, sourceName);

    if (reference.type === "imageReference") {
      validateImageReference(definition.url, reference.alt ?? "", sourceName);
      images.push({ node: definition, url: definition.url, alt: reference.alt ?? "" });
    } else {
      links.push({
        node: definition,
        url: definition.url,
        label: markdownText(reference).trim() || reference.identifier,
      });
    }
  }

  const plainText = markdownText(tree).trim();
  assertBlog(plainText.length > 0, "Markdown body must contain visible text", sourceName);
  assertBlog(headings.some((heading) => heading.depth === 2), "Markdown body must contain an H2 section", sourceName);

  const words = plainText.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) ?? [];

  return {
    tree,
    headings,
    headingIds: new Set(headings.map((heading) => heading.id)),
    headingBaseSlugs: new Set(headings.map((heading) => heading.baseSlug)),
    links,
    images,
    referencedMedia: new Set(images.map((image) => image.url)),
    readingTimeMinutes: Math.max(1, Math.ceil(words.length / READING_WORDS_PER_MINUTE)),
  };
}

function normalizeInternalPath(pathname) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function validateKnownInternalPath(pathname, sourceArticle, articlesBySlug, sourceName) {
  if (FIXED_SITE_PATHS.has(pathname)) return undefined;

  const blogMatch = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pathname);
  assertBlog(blogMatch, `internal link points to unknown route "${pathname}"`, sourceName);

  const target = articlesBySlug.get(blogMatch[1]);
  assertBlog(target, `internal link points to missing article "${pathname}"`, sourceName);
  assertBlog(
    sourceArticle.frontmatter.status === "draft" || target.frontmatter.status === "published",
    `published article links to draft article "${pathname}"`,
    sourceName,
  );
  return target;
}

function normalizeFragment(fragment, analysis, sourceName, label) {
  if (!fragment) return "";
  let decoded;
  try {
    decoded = decodeURIComponent(fragment.slice(1));
  } catch {
    throw new BlogValidationError(`link "${label}" has an invalid fragment`, sourceName);
  }

  const normalized = decoded.startsWith("section-") ? decoded : `section-${decoded}`;
  assertBlog(
    analysis.headingIds.has(normalized),
    `link "${label}" points to missing heading "#${decoded}"`,
    sourceName,
  );
  return `#${normalized}`;
}

export function validateArticleLinks(article, articlesBySlug) {
  const { analysis, sourceName } = article;
  const articlePath = `/blog/${article.slug}`;

  for (const link of analysis.links) {
    const rawUrl = link.url.trim();
    const label = link.label || rawUrl;
    assertBlog(rawUrl === link.url && rawUrl.length > 0, `link "${label}" has an invalid URL`, sourceName);
    assertBlog(!rawUrl.startsWith("//"), `link "${label}" uses a protocol-relative URL`, sourceName);

    if (rawUrl.startsWith("#")) {
      link.node.url = normalizeFragment(rawUrl, analysis, sourceName, label);
      continue;
    }

    if (rawUrl.startsWith("/")) {
      const parsed = new URL(rawUrl, CANONICAL_ORIGIN);
      assertBlog(!parsed.search, `internal link "${label}" must not contain a query string`, sourceName);
      assertBlog(!parsed.pathname.includes("%"), `internal link "${label}" must not contain encoded path data`, sourceName);
      const pathname = normalizeInternalPath(parsed.pathname);
      const targetArticle = validateKnownInternalPath(pathname, article, articlesBySlug, sourceName);
      if (parsed.hash && (pathname === articlePath || targetArticle)) {
        parsed.hash = normalizeFragment(
          parsed.hash,
          targetArticle?.analysis ?? analysis,
          sourceName,
          label,
        );
      }
      link.node.url = `${pathname}${parsed.hash}`;
      continue;
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new BlogValidationError(
        `link "${label}" must be an HTTPS, mailto, root-relative, or fragment URL`,
        sourceName,
      );
    }

    if (parsed.protocol === "mailto:") {
      assertBlog(!/[\r\n]/.test(rawUrl), `link "${label}" contains an invalid mailto URL`, sourceName);
      continue;
    }

    assertBlog(parsed.protocol === "https:", `link "${label}" must use HTTPS`, sourceName);
    assertBlog(!parsed.username && !parsed.password, `link "${label}" must not contain credentials`, sourceName);
    assertBlog(
      !parsed.hostname.endsWith(".vercel.app"),
      `link "${label}" must not point to a Vercel preview`,
      sourceName,
    );

    if (parsed.hostname === "www.patchtray.io") {
      assertBlog(parsed.origin === CANONICAL_ORIGIN, `link "${label}" uses a non-canonical PatchTray origin`, sourceName);
      assertBlog(!parsed.search, `internal link "${label}" must not contain a query string`, sourceName);
      const pathname = normalizeInternalPath(parsed.pathname);
      const targetArticle = validateKnownInternalPath(pathname, article, articlesBySlug, sourceName);
      if (parsed.hash && (pathname === articlePath || targetArticle)) {
        parsed.hash = normalizeFragment(
          parsed.hash,
          targetArticle?.analysis ?? analysis,
          sourceName,
          label,
        );
      }
      link.node.url = `${pathname}${parsed.hash}`;
      continue;
    }

    assertBlog(
      parsed.hostname !== "patchtray.io" && !parsed.hostname.endsWith(".patchtray.io"),
      `link "${label}" uses a non-canonical PatchTray host`,
      sourceName,
    );
  }
}

function responsiveImagePlugin(mediaBySource) {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || typeof node.properties?.src !== "string" || !parent || index === undefined) {
        return;
      }

      const media = mediaBySource.get(node.properties.src);
      if (!media) return;

      const srcSet = (format) =>
        media.variants
          .filter((variant) => variant.format === format)
          .map((variant) => `${variant.url} ${variant.width}w`)
          .join(", ");
      const fallbackVariants = media.variants.filter((variant) => variant.format === media.fallbackFormat);
      const fallback = fallbackVariants.at(-1);

      parent.children[index] = {
        type: "element",
        tagName: "picture",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "source",
            properties: {
              type: "image/avif",
              srcSet: srcSet("avif"),
              sizes: "(max-width: 860px) calc(100vw - 48px), 780px",
            },
            children: [],
          },
          {
            type: "element",
            tagName: "source",
            properties: {
              type: "image/webp",
              srcSet: srcSet("webp"),
              sizes: "(max-width: 860px) calc(100vw - 48px), 780px",
            },
            children: [],
          },
          {
            type: "element",
            tagName: "img",
            properties: {
              alt: node.properties.alt ?? "",
              decoding: "async",
              height: media.height,
              loading: "lazy",
              sizes: "(max-width: 860px) calc(100vw - 48px), 780px",
              src: fallback.url,
              srcSet: fallbackVariants.map((variant) => `${variant.url} ${variant.width}w`).join(", "),
              width: media.width,
            },
            children: [],
          },
        ],
      };
    });
  };
}

export async function compileMarkdown(analysis, mediaBySource, sourceName) {
  const processor = unified()
    .use(remarkRehype)
    .use(responsiveImagePlugin, mediaBySource)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeSanitize, SANITIZE_SCHEMA)
    .use(rehypeStringify);

  try {
    const transformed = await processor.run(analysis.tree);
    return processor.stringify(transformed);
  } catch (error) {
    throw new BlogValidationError(
      `Markdown compilation failed (${error instanceof Error ? error.message : String(error)})`,
      sourceName,
    );
  }
}
