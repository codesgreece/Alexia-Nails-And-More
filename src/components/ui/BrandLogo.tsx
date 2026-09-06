import { cn } from "@/lib/utils";

export function BrandLogo({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-auto w-auto object-contain", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
