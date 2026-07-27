import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, parse, resolve } from "node:path";
import sharp from "sharp";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_ARTICLE_MEDIA_BYTES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  RESPONSIVE_WIDTHS,
} from "./config.mjs";
import { assertBlog, BlogValidationError } from "./errors.mjs";

function contentHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

function decodedFormat(metadata) {
  if (metadata.mediaType === "image/avif") return "avif";
  if (metadata.format === "heif" && metadata.compression === "av1") return "avif";
  if (metadata.format === "jpeg") return "jpeg";
  if (metadata.format === "png") return "png";
  if (metadata.format === "webp") return "webp";
  return metadata.format;
}

function expectedFormat(extension) {
  if (extension === ".jpg" || extension === ".jpeg") return "jpeg";
  return extension.slice(1);
}

function orientedDimensions(metadata) {
  const swapsAxes = metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8;
  return swapsAxes
    ? { width: metadata.height, height: metadata.width }
    : { width: metadata.width, height: metadata.height };
}

async function inspectImage(buffer, extension, sourceName) {
  assertBlog(buffer.byteLength <= MAX_IMAGE_BYTES, "image exceeds the 8 MiB source limit", sourceName);

  let metadata;
  try {
    metadata = await sharp(buffer, {
      animated: true,
      limitInputPixels: MAX_IMAGE_DIMENSION * MAX_IMAGE_DIMENSION,
    }).metadata();
  } catch (error) {
    throw new BlogValidationError(
      `image could not be decoded (${error instanceof Error ? error.message : String(error)})`,
      sourceName,
    );
  }

  const format = decodedFormat(metadata);
  assertBlog(format === expectedFormat(extension), `decoded ${format ?? "unknown"} data does not match ${extension}`, sourceName);
  assertBlog((metadata.pages ?? 1) === 1, "animated images are not supported", sourceName);

  const dimensions = orientedDimensions(metadata);
  assertBlog(dimensions.width && dimensions.height, "image has no decoded dimensions", sourceName);
  assertBlog(
    dimensions.width <= MAX_IMAGE_DIMENSION && dimensions.height <= MAX_IMAGE_DIMENSION,
    `image dimensions exceed ${MAX_IMAGE_DIMENSION} pixels`,
    sourceName,
  );

  return {
    ...dimensions,
    hasAlpha: metadata.hasAlpha === true,
  };
}

function variantWidths(sourceWidth) {
  return [...new Set(RESPONSIVE_WIDTHS.map((width) => Math.min(width, sourceWidth)))].sort(
    (left, right) => left - right,
  );
}

function outputExtension(format) {
  return format === "jpeg" ? "jpg" : format;
}

async function encodeVariant(buffer, width, format, hasAlpha) {
  let pipeline = sharp(buffer, { animated: false }).rotate().resize({
    width,
    withoutEnlargement: true,
    fit: "inside",
  });

  if (format === "avif") pipeline = pipeline.avif({ quality: 55, effort: 4 });
  if (format === "webp") pipeline = pipeline.webp({ quality: 78, effort: 4 });
  if (format === "jpeg") pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  if (format === "png") pipeline = pipeline.png({ compressionLevel: 9 });

  return pipeline.toBuffer();
}

async function generateVariants({
  articleSlug,
  buffer,
  dimensions,
  emit,
  outputAssetsDirectory,
  sourcePath,
}) {
  const fallbackFormat = dimensions.hasAlpha ? "png" : "jpeg";
  const formats = ["avif", "webp", fallbackFormat];
  const variants = [];
  const baseName = parse(sourcePath.slice(2)).name.replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();

  if (emit) await mkdir(outputAssetsDirectory, { recursive: true });

  for (const format of formats) {
    for (const width of variantWidths(dimensions.width)) {
      let output;
      try {
        output = await encodeVariant(buffer, width, format, dimensions.hasAlpha);
      } catch (error) {
        throw new BlogValidationError(
          `image processing failed for ${sourcePath} (${error instanceof Error ? error.message : String(error)})`,
          articleSlug,
        );
      }

      const extension = outputExtension(format);
      const filename = `${articleSlug}-${baseName}-${width}-${contentHash(output)}.${extension}`;
      if (emit) {
        await writeFile(resolve(outputAssetsDirectory, filename), output);
      }
      variants.push({
        format,
        height: Math.round((dimensions.height / dimensions.width) * width),
        url: `/assets/blog/${filename}`,
        width,
      });
    }
  }

  return {
    fallbackFormat,
    height: dimensions.height,
    source: sourcePath,
    variants,
    width: dimensions.width,
  };
}

export async function processArticleMedia({
  articleDirectory,
  articleSlug,
  emit,
  mediaFiles,
  outputAssetsDirectory,
  referencedMedia,
  sourceName,
}) {
  const fileSizes = await Promise.all(
    mediaFiles.map(async (filename) => {
      const fileStat = await stat(resolve(articleDirectory, filename));
      return { filename, size: fileStat.size };
    }),
  );
  const totalBytes = fileSizes.reduce((total, file) => total + file.size, 0);
  assertBlog(
    totalBytes <= MAX_ARTICLE_MEDIA_BYTES,
    "article source media exceeds the 24 MiB limit",
    sourceName,
  );

  const filesBySource = new Map(mediaFiles.map((filename) => [`./${filename}`, filename]));
  for (const sourcePath of referencedMedia) {
    assertBlog(filesBySource.has(sourcePath), `referenced image "${sourcePath}" does not exist`, sourceName);
  }

  const inspectionBySource = new Map();
  for (const filename of mediaFiles) {
    const extension = extname(filename).toLowerCase();
    assertBlog(
      ACCEPTED_IMAGE_EXTENSIONS.has(extension),
      `unsupported media file "${filename}"`,
      sourceName,
    );
    const buffer = await readFile(resolve(articleDirectory, filename));
    const dimensions = await inspectImage(buffer, extension, `${sourceName}/${filename}`);
    inspectionBySource.set(`./${filename}`, { buffer, dimensions });
  }

  const mediaBySource = new Map();
  for (const sourcePath of [...referencedMedia].sort()) {
    const inspected = inspectionBySource.get(sourcePath);
    const media = await generateVariants({
      articleSlug,
      buffer: inspected.buffer,
      dimensions: inspected.dimensions,
      emit,
      outputAssetsDirectory,
      sourcePath,
    });
    mediaBySource.set(sourcePath, media);
  }

  return mediaBySource;
}
