import type { BlogImage } from "../../lib/blogTypes";

function sourceSet(image: BlogImage, format: BlogImage["variants"][number]["format"]) {
  return image.variants
    .filter((variant) => variant.format === format)
    .map((variant) => `${variant.url} ${variant.width}w`)
    .join(", ");
}

export function BlogResponsiveImage({
  className,
  image,
  priority = false,
  sizes,
}: {
  className?: string;
  image: BlogImage;
  priority?: boolean;
  sizes: string;
}) {
  const fallbackVariants = image.variants.filter(
    (variant) => variant.format === image.fallbackFormat,
  );
  const fallback = fallbackVariants.at(-1);
  if (!fallback) throw new Error(`[blog:image] ${image.source} has no fallback variant`);

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={sourceSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={sourceSet(image, "webp")} sizes={sizes} />
      <img
        src={fallback.url}
        srcSet={fallbackVariants.map((variant) => `${variant.url} ${variant.width}w`).join(", ")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
