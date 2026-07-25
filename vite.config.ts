import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fetchLatestManifest } from "./src/lib/release";

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

export default defineConfig(async () => ({
  plugins: [react(), releaseApiDevServer()],
  define: {
    __RELEASE_MANIFEST__: JSON.stringify(await releaseManifestSeed()),
  },
}));
