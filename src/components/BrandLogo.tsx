import Image from "next/image";

type BrandLogoSize = "sm" | "md" | "lg";
type BrandLogoVariant = "auto" | "light" | "dark";

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: BrandLogoSize;
  showText?: boolean;
  priority?: boolean;
  variant?: BrandLogoVariant;
}

const LOGO_MARK_SRC = "/brand/naik-kelas-bg-removed-143x146.png";

const sizeStyles: Record<
  BrandLogoSize,
  { mark: number; wrapper: string; name: string; tagline: string; gap: string; taglineGap: string }
> = {
  sm: {
    mark: 32,
    wrapper: "h-9",
    name: "text-[1.05rem]",
    tagline: "text-[0.35rem]",
    gap: "gap-1.5",
    taglineGap: "mt-0.5",
  },
  md: {
    mark: 42,
    wrapper: "h-12",
    name: "text-[1.45rem]",
    tagline: "text-[0.48rem]",
    gap: "gap-2",
    taglineGap: "mt-1",
  },
  lg: {
    mark: 56,
    wrapper: "h-16",
    name: "text-[1.95rem]",
    tagline: "text-[0.65rem]",
    gap: "gap-3",
    taglineGap: "mt-1",
  },
};

export function BrandLogo({
  className = "",
  markClassName = "",
  textClassName = "",
  size = "md",
  showText = true,
  priority = false,
  variant = "auto",
}: BrandLogoProps) {
  const styles = sizeStyles[size];
  const nameToneClassName =
    variant === "dark"
      ? "text-white"
      : variant === "light"
        ? "text-[#0d2450]"
        : "text-[#0d2450] dark:text-white";
  const taglineToneClassName =
    variant === "dark"
      ? "text-white/80"
      : variant === "light"
        ? "text-[#42526f]"
        : "text-[#42526f] dark:text-white/80";

  return (
    <span
      className={`inline-flex min-w-0 shrink-0 items-center ${styles.wrapper} ${styles.gap} ${className}`}
      aria-label="Naik Kelas"
      role="img"
    >
      <Image
        src={LOGO_MARK_SRC}
        alt=""
        aria-hidden="true"
        width={styles.mark}
        height={styles.mark}
        priority={priority}
        unoptimized
        className={`shrink-0 object-contain ${markClassName}`}
        style={{ width: styles.mark, height: styles.mark }}
      />
      {showText && (
        <span className="flex min-w-0 flex-col justify-center leading-none">
          <span className={`font-headline-md font-extrabold leading-none tracking-normal ${styles.name} ${nameToneClassName} ${textClassName}`}>
            Naik<span className="text-[#2375f4]">Kelas</span>
          </span>
          <span className={`${styles.taglineGap} whitespace-nowrap font-body-md font-bold uppercase leading-none tracking-[0.18em] ${styles.tagline} ${taglineToneClassName}`}>
            Belajar Tumbuh Berkembang
          </span>
        </span>
      )}
    </span>
  );
}
