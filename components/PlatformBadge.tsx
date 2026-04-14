import type { Platform } from "@/lib/types";

const BADGE_BG: Record<Platform, string> = {
  chatgpt:  "#10a37f",
  claude:   "#d97706",
  gemini:   "#4285f4",
  deepseek: "#4f6ef7",
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className="w-[18px] h-[18px] rounded-sm flex items-center justify-center flex-shrink-0"
      style={{ background: BADGE_BG[platform] ?? "#555" }}
      title={platform}
    >
      <PlatformIcon platform={platform} />
    </span>
  );
}

function PlatformIcon({ platform }: { platform: Platform }) {
  const svgProps = {
    width: 12,
    height: 12,
    viewBox: "0 0 14 14",
    fill: "none" as const,
  };

  switch (platform) {
    case "chatgpt":
      // OpenAI: hexagon outline + center dot
      return (
        <svg {...svgProps}>
          <path
            d="M7 1.5 L11.2 3.85 L11.2 10.15 L7 12.5 L2.8 10.15 L2.8 3.85 Z"
            stroke="white"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="1.5" fill="white" />
        </svg>
      );

    case "claude":
      // Anthropic logo: 3 vertical pillars, centre tallest
      return (
        <svg {...svgProps}>
          <rect x="1.8" y="5.2" width="2.5" height="7.3" rx="1.25" fill="white" />
          <rect x="5.75" y="1.5" width="2.5" height="11" rx="1.25" fill="white" />
          <rect x="9.7" y="5.2" width="2.5" height="7.3" rx="1.25" fill="white" />
        </svg>
      );

    case "gemini":
      // Gemini logo: 4-pointed star with proportional arms (not a "+")
      return (
        <svg {...svgProps}>
          <path
            d="M7 0.5 L9 4.9 L13.5 7 L9 9.1 L7 13.5 L5 9.1 L0.5 7 L5 4.9 Z"
            fill="white"
          />
        </svg>
      );

    case "deepseek":
      // DeepSeek: two stacked wave lines (ocean/sea imagery from their brand)
      return (
        <svg {...svgProps}>
          <path
            d="M1.5 4.8 Q4.5 2.3 7 4.8 Q9.5 7.3 12.5 4.8"
            stroke="white"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          <path
            d="M1.5 9.2 Q4.5 6.7 7 9.2 Q9.5 11.7 12.5 9.2"
            stroke="white"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
