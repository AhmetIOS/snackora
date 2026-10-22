import Image from "next/image";
import type { MachineIllustration as Kind } from "@/content/machines";

/**
 * Machine illustration as a static, cacheable SVG file (public/illustrations/,
 * generated from machines.tsx by `npm run brand:illustrations`). Keeps ~40–50 KB
 * of SVG markup per machine out of the HTML and the RSC payload.
 */
export function MachineImage({ kind, alt = "", className, preload }: { kind: Kind; alt?: string; className?: string; preload?: boolean }) {
  return (
    <Image
      src={`/illustrations/machine-${kind}.svg`}
      alt={alt}
      width={400}
      height={760}
      unoptimized
      preload={preload}
      className={className}
    />
  );
}
