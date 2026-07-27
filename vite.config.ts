import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readGeneratedBlogAsset } from "./scripts/blog/assets.mjs";
import { CANONICAL_ORIGIN } from "./scripts/blog/config.mjs";
import { createBlogRegenerationQueue } from "./scripts/blog/development.mjs";
import { errorMessage } from "./scripts/blog/errors.mjs";
import { generateBlog } from "./scripts/blog/generator.mjs";
import { createBlogFeed } from "./src/lib/blogFeed";
import { parseBlogCatalog } from "./src/lib/blogData";
import type { BlogCatalog } from "./src/lib/blogTypes";
import { fetchLatestManifest } from "./src/lib/release";

const projectRoot = import.meta.dirname;
const blogContentDirectory = resolve(projectRoot, "content", "blog");
const blogPostsDirectory = resolve(blogContentDirectory, "posts");
const generatedBlogDirectory = resolve(projectRoot, ".generated", "blog");
const generatedBlogAssetsDirectory = resolve(generatedBlogDirectory, "assets");
const generatedBlogCatalogPath = resolve(generatedBlogDirectory, "catalog.json");
const generatedBlogManifestPath = resolve(generatedBlogDirectory, "manifest.json");

type BlogBuildState = {
  catalog: BlogCatalog;
  enabled: boolean;
  slugSignature: string;
};

async function readBlogBuildState(
  allowDraftPreview: boolean,
): Promise<BlogBuildState> {
  const [artifact, manifest]: [unknown, unknown] = await Promise.all([
    readFile(generatedBlogCatalogPath, "utf8").then(JSON.parse),
    readFile(generatedBlogManifestPath, "utf8").then(JSON.parse),
  ]);
  const previewArtifact =
    typeof manifest === "object" &&
    manifest !== null &&
    "preview" in manifest &&
    manifest.preview === true;
  if (previewArtifact && !allowDraftPreview) {
    throw new Error(
      "[blog:preview] refusing to use draft preview artifacts outside npm run dev:blog; run npm run blog:generate first",
    );
  }
  const catalog = parseBlogCatalog(artifact);
  const slugs = catalog.posts.map((post) => post.slug);
  return {
    catalog,
    enabled: slugs.length > 0,
    slugSignature: slugs.join("\n"),
  };
}

/**
 * Build-time snapshot of the published release manifest, injected as
 * `__RELEASE_MANIFEST__`. The site still refreshes it at runtime via
 * `/api/release`; this only makes the first paint correct instead of showing
 * the env fallback for a frame. A failed fetch must never fail the build.
 */
async function releaseManifestSeed(): Promise<unknown> {
  try {
    return await fetchLatestManifest();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[release] build-time manifest unavailable (${reason}); falling back to VITE_* values`);
    return null;
  }
}

/** Serves `/api/release` during `vite dev`, mirroring the Vercel function. */
function releaseApiDevServer(): Plugin {
  return {
    name: "patchtray-release-api-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/release", (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        fetchLatestManifest()
          .then((manifest) => {
            response.statusCode = 200;
            response.end(JSON.stringify(manifest));
          })
          .catch((error: unknown) => {
            response.statusCode = 502;
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : "unavailable" }));
          });
      });
    },
  };
}

function isBlogContentPath(path: string): boolean {
  const pathFromContentRoot = relative(blogContentDirectory, resolve(path));
  return (
    pathFromContentRoot === "" ||
    (!pathFromContentRoot.startsWith("..") && !pathFromContentRoot.startsWith("/"))
  );
}

/** Regenerates local content and serves its ephemeral image output in Vite. */
function blogContentDevServer(
  initialState: BlogBuildState,
  includeDrafts: boolean,
): Plugin {
  return {
    name: "patchtray-blog-content-dev",
    apply: "serve",
    configureServer(server) {
      let currentState = initialState;
      const regeneration = createBlogRegenerationQueue({
        generate: () =>
          generateBlog({
            includeDrafts,
            outputDirectory: generatedBlogDirectory,
            postsDirectory: blogPostsDirectory,
          }),
        async onSuccess(result) {
          server.config.logger.info(
            `[blog:dev] regenerated ${result.publishedCount} published and ${result.draftCount} draft article(s)` +
              (includeDrafts
                ? `; previewing ${result.previewCount} draft article(s)`
                : ""),
          );
          const nextState = await readBlogBuildState(includeDrafts);
          if (nextState.slugSignature !== currentState.slugSignature) {
            await server.restart();
            return;
          }
          currentState = nextState;
          server.ws.send({ type: "full-reload" });
        },
        onError(error) {
          server.config.logger.error(
            `[blog:dev] generation failed; keeping the last successful output\n${errorMessage(error)}`,
          );
        },
      });

      server.watcher.add(blogContentDirectory);
      const schedule = (path: string) => {
        if (isBlogContentPath(path)) regeneration.schedule();
      };
      server.watcher.on("add", schedule);
      server.watcher.on("change", schedule);
      server.watcher.on("unlink", schedule);
      server.watcher.on("addDir", schedule);
      server.watcher.on("unlinkDir", schedule);
      server.httpServer?.once("close", () => regeneration.close());

      server.middlewares.use("/blog/feed.xml", (request, response, next) => {
        const requestPath = (request.url ?? "/").split("?")[0];
        if (
          requestPath !== "/" ||
          (request.method !== "GET" && request.method !== "HEAD")
        ) {
          next();
          return;
        }

        const publishedPosts = currentState.catalog.posts.filter(
          (post) => post.preview !== true,
        );
        const feed = createBlogFeed(
          {
            ...currentState.catalog,
            featuredSlug:
              currentState.catalog.featuredSlug &&
              publishedPosts.some(
                (post) => post.slug === currentState.catalog.featuredSlug,
              )
                ? currentState.catalog.featuredSlug
                : publishedPosts[0]?.slug ?? null,
            posts: publishedPosts,
          },
          CANONICAL_ORIGIN,
        );
        if (!feed) {
          response.statusCode = 404;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end("Blog feed not found");
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "application/atom+xml; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        response.end(request.method === "HEAD" ? undefined : feed);
      });

      server.middlewares.use("/assets/blog", async (request, response, next) => {
        if (request.method !== "GET" && request.method !== "HEAD") {
          next();
          return;
        }

        try {
          const asset = await readGeneratedBlogAsset(
            request.url ?? "/",
            generatedBlogAssetsDirectory,
          );
          if (!asset) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain; charset=utf-8");
            response.end("Blog asset not found");
            return;
          }

          response.statusCode = 200;
          response.setHeader("Content-Type", asset.contentType);
          response.setHeader("Cache-Control", "no-store");
          response.end(request.method === "HEAD" ? undefined : asset.body);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(async ({ command, mode }) => {
  const includeDrafts =
    command === "serve" && mode === "blog-preview";
  const [releaseManifest, blogState] = await Promise.all([
    releaseManifestSeed(),
    readBlogBuildState(includeDrafts),
  ]);

  return {
    plugins: [
      react(),
      releaseApiDevServer(),
      blogContentDevServer(blogState, includeDrafts),
    ],
    define: {
      __BLOG_ENABLED__: JSON.stringify(blogState.enabled),
      __RELEASE_MANIFEST__: JSON.stringify(releaseManifest),
    },
  };
});
