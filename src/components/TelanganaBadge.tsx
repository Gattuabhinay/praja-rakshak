import Image from "next/image";
import { BRAND } from "@/lib/brand";

type TelanganaBadgeProps = {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

const SIZES = {
  sm: 36,
  md: 56,
  lg: 168,
} as const;

export function TelanganaBadge({
  size = "md",
  showLabel = false,
}: TelanganaBadgeProps) {
  const px = SIZES[size];
  return (
    <div className={`tg-badge tg-badge-${size}`}>
      <Image
        src={BRAND.telanganaEmblemSrc}
        alt={BRAND.stateOfficial}
        width={px * 2}
        height={px * 2}
        className="tg-emblem"
        priority={size === "lg"}
      />
      {showLabel ? (
        <div className="tg-badge-copy">
          <strong>{BRAND.stateOfficial}</strong>
          <span>Official citizen services context</span>
        </div>
      ) : null}
    </div>
  );
}
