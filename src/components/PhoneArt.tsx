import type { ReactNode } from "react";

type Props = { variant?: "glass" | "display" | "back" | "clean" | "fixed"; className?: string; children?: ReactNode };

// One illustrated phone, five states. Pure SVG so it ships zero image bytes.
export default function PhoneArt({ variant = "glass", className = "", children }: Props) {
  const back = variant === "back";
  const fixed = variant === "fixed";
  return (
    <svg viewBox="0 0 120 240" className={`phone ${className}`} aria-hidden="true">
      {fixed && (
        <defs>
          <linearGradient id="ph-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFD2C9" />
            <stop offset="0.45" stopColor="#FF6B57" />
            <stop offset="1" stopColor="#0D6E73" />
          </linearGradient>
        </defs>
      )}
      <rect x="4" y="4" width="112" height="232" rx="24" className="ph-body" />
      {back ? (
        <>
          <rect x="16" y="16" width="44" height="44" rx="13" className="ph-cam" />
          <circle cx="30" cy="30" r="7" className="ph-lens" />
          <circle cx="46" cy="30" r="7" className="ph-lens" />
          <circle cx="30" cy="46" r="7" className="ph-lens" />
        </>
      ) : (
        <>
          <rect x="11" y="11" width="98" height="218" rx="18" className={fixed ? undefined : "ph-screen"} fill={fixed ? "url(#ph-wall)" : undefined} />
          <rect x="44" y="19" width="32" height="9" rx="4.5" className="ph-island" />
        </>
      )}
      {fixed && (
        <>
          <text x="60" y="76" textAnchor="middle" className="ph-time">
            9:41
          </text>
          <rect x="42" y="214" width="36" height="4" rx="2" fill="#fff" opacity="0.8" />
          <path d="M22 60 Q60 20 98 44" stroke="#fff" strokeWidth="14" opacity="0.08" fill="none" strokeLinecap="round" />
        </>
      )}
      {variant === "display" && (
        <g className="ph-lines">
          <rect x="34" y="11" width="3" height="218" fill="#35D07F" />
          <rect x="58" y="11" width="2" height="218" fill="#FF4FD8" />
          <rect x="63" y="11" width="5" height="218" fill="#4F8BFF" />
          <ellipse cx="88" cy="186" rx="26" ry="34" fill="#000" opacity=".8" />
        </g>
      )}
      {(variant === "glass" || variant === "back") && (
        <g className="ph-cracks">
          <path d="M78 150 L52 118 L60 92 L34 60 L40 30" />
          <path d="M78 150 L96 112 L88 84 L104 52" />
          <path d="M78 150 L48 164 L30 196 L16 204" />
          <path d="M78 150 L92 182 L84 214" />
          <path d="M52 118 L24 124" />
          <path d="M96 112 L108 122" />
          <path d="M60 92 L82 78" />
        </g>
      )}
      {children}
    </svg>
  );
}
