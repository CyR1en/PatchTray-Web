type CaptureImageProps = {
  alt: string;
  baseName: string;
  height: number;
  sizes: string;
  sourceWidths: readonly [number, number];
  width: number;
};

function sourceSet(baseName: string, widths: readonly number[], extension: "avif" | "webp") {
  return widths.map((width) => `/assets/${baseName}-${width}.${extension} ${width}w`).join(", ");
}

/** Responsive screenshot with modern formats and the source PNG as fallback. */
export function CaptureImage({
  alt,
  baseName,
  height,
  sizes,
  sourceWidths,
  width,
}: CaptureImageProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={sourceSet(baseName, sourceWidths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={sourceSet(baseName, sourceWidths, "webp")} sizes={sizes} />
      <img
        src={`/assets/${baseName}.png`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
