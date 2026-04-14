import { PLATFORMS, type Platform } from "@/lib/types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const p = PLATFORMS[platform];
  if (!p) return null;

  return (
    <span
      className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
      style={{ background: p.color }}
      title={p.name}
    >
      {p.icon}
    </span>
  );
}
