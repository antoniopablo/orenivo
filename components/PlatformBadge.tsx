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
      // OpenAI: solid hexagon — no inner structure so it doesn't look like a gear
      return (
        <svg {...svgProps}>
          <path
            d="M7 1.2 L11.4 3.6 L11.4 10.4 L7 12.8 L2.6 10.4 L2.6 3.6 Z"
            fill="white"
          />
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
      // Gemini logo: two crossed bezier lenses forming the real sparkle star
      return (
        <svg {...svgProps}>
          <path
            d="M7 0.5 Q9.8 4 9.8 7 Q9.8 10 7 13.5 Q4.2 10 4.2 7 Q4.2 4 7 0.5Z"
            fill="white"
          />
          <path
            d="M0.5 7 Q4 4.2 7 4.2 Q10 4.2 13.5 7 Q10 9.8 7 9.8 Q4 9.8 0.5 7Z"
            fill="white"
          />
        </svg>
      );

    case "deepseek":
      // DeepSeek: "D" letter outline
      return (
        <svg {...svgProps}>
          <path
            d="M3.5 2.5 L3.5 11.5 L7.5 11.5 Q11.5 11.5 11.5 7 Q11.5 2.5 7.5 2.5 Z"
            stroke="white"
            strokeWidth="1.4"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
