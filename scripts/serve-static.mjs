import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { pipeline } from "node:stream";
import { createGzip } from "node:zlib";

const outputRoot = resolve(import.meta.dirname, "..", "dist");
const port = Number.parseInt(process.env.PREVIEW_PORT ?? "4173", 10);

const caseRedirects = new Map([
  ["/Download", "/download"],
  ["/Guide", "/guide"],
  ["/Privacy", "/privacy"],
  ["/Terms", "/terms"],
  ["/Refunds", "/refunds"],
  ["/Support", "/support"],
  ["/Concepts", "/concepts"],
  ["/Checkout/Success", "/checkout/success"],
]);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".avif", "image/avif"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

const noindexPaths = new Set(["/checkout/success", "/concepts"]);
const compressibleExtensions = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".xml"]);

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function safeOutputPath(pathname) {
  const path = resolve(outputRoot, `.${pathname}`);
  return path === outputRoot || path.startsWith(`${outputRoot}${sep}`) ? path : undefined;
}

function redirect(response, location) {
  response.writeHead(308, { location });
  response.end();
}

async function resolveRequest(pathname) {
  if (pathname === "/") return { path: resolve(outputRoot, "index.html"), status: 200 };

  const direct = safeOutputPath(pathname);
  if (direct && (await isFile(direct))) return { path: direct, status: 200 };

  const cleanHtml = safeOutputPath(`${pathname}.html`);
  if (cleanHtml && (await isFile(cleanHtml))) return { path: cleanHtml, status: 200 };

  return { path: resolve(outputRoot, "404.html"), status: 404 };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const caseDestination = caseRedirects.get(pathname);
  if (caseDestination) {
    redirect(response, `${caseDestination}${url.search}`);
    return;
  }

  if (pathname !== "/" && pathname.endsWith("/")) {
    redirect(response, `${pathname.replace(/\/+$/, "")}${url.search}`);
    return;
  }

  if (pathname.endsWith(".html")) {
    const destination = pathname === "/index.html" ? "/" : pathname.slice(0, -5);
    redirect(response, `${destination}${url.search}`);
    return;
  }

  const result = await resolveRequest(pathname);
  const extension = extname(result.path);
  const type = contentTypes.get(extension) ?? "application/octet-stream";
  const acceptsGzip = request.headers["accept-encoding"]?.includes("gzip") === true;
  const shouldCompress = acceptsGzip && compressibleExtensions.has(extension);
  const headers = { "content-type": type, vary: "Accept-Encoding" };
  if (shouldCompress) headers["content-encoding"] = "gzip";
  if (noindexPaths.has(pathname)) headers["x-robots-tag"] = "noindex, follow";
  response.writeHead(result.status, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  if (shouldCompress) {
    pipeline(createReadStream(result.path), createGzip(), response, (error) => {
      if (error) response.destroy(error);
    });
    return;
  }
  createReadStream(result.path).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static preview: http://127.0.0.1:${port}`);
});
