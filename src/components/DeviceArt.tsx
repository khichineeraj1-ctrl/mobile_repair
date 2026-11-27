import type { DeviceKind } from "@/lib/catalog";
import PhoneArt from "./PhoneArt";

type Props = { kind: DeviceKind; repair?: string; fixed?: boolean; className?: string };

const Wall = () => (
  <defs>
    <linearGradient id="ph-wall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFD2C9" />
      <stop offset="0.45" stopColor="#FF6B57" />
      <stop offset="1" stopColor="#0D6E73" />
    </linearGradient>
  </defs>
);

// Low battery glyph, centred on (x, y).
const Battery = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x - 26} ${y - 14})`}>
    <rect width="46" height="28" rx="6" fill="none" stroke="#fff" strokeWidth="4" />
    <rect x="48" y="9" width="5" height="10" rx="2" fill="#fff" />
    <rect x="6" y="6" width="9" height="16" rx="2" fill="#D43B3B" />
  </g>
);

// Illustrated iPhone, iPad or MacBook showing the chosen fault. Pure SVG.
export default function DeviceArt({ kind, repair = "display", fixed = false, className = "" }: Props) {
  if (kind === "iphone") {
    const v = fixed ? "fixed" : repair === "glass" || repair === "back" ? repair : "display";
    return <PhoneArt variant={v} className={className} />;
  }

  if (kind === "ipad")
    return (
      <svg viewBox="0 0 180 240" className={`phone art-ipad ${className}`} aria-hidden="true">
        {fixed && <Wall />}
        <rect x="4" y="4" width="172" height="232" rx="20" className="ph-body" />
        <rect x="14" y="14" width="152" height="212" rx="10" className={fixed ? undefined : "ph-screen"} fill={fixed ? "url(#ph-wall)" : undefined} />
        <circle cx="90" cy="9" r="2" fill="#4a5e5f" />
        {!fixed && repair === "display" && (
          <g>
            <rect x="52" y="14" width="4" height="212" fill="#35D07F" />
            <rect x="92" y="14" width="3" height="212" fill="#FF4FD8" />
            <rect x="99" y="14" width="7" height="212" fill="#4F8BFF" />
            <ellipse cx="134" cy="182" rx="32" ry="40" fill="#000" opacity=".8" />
          </g>
        )}
        {!fixed && repair === "glass" && (
          <g className="ph-cracks">
            <path d="M118 150 L76 116 L90 86 L48 56 L58 22" />
            <path d="M118 150 L146 108 L134 78 L160 44" />
            <path d="M118 150 L70 166 L44 200 L18 208" />
            <path d="M118 150 L138 186 L126 222" />
            <path d="M76 116 L24 124" />
          </g>
        )}
        {!fixed && repair === "battery" && <Battery x={90} y={120} />}
      </svg>
    );

  if (kind === "watch")
    return (
      <svg viewBox="0 0 160 240" className={`phone art-watch ${className}`} aria-hidden="true">
        {fixed && <Wall />}
        <path d="M46 6h68l8 52H38z" className="ph-cam" />
        <path d="M38 182h84l-8 52H46z" className="ph-cam" />
        <rect x="136" y="96" width="12" height="26" rx="5" className="ph-body" />
        <rect x="18" y="50" width="124" height="140" rx="34" className="ph-body" />
        <rect x="28" y="60" width="104" height="120" rx="26" className={fixed ? undefined : "ph-screen"} fill={fixed ? "url(#ph-wall)" : undefined} />
        {fixed && (
          <text x="80" y="130" textAnchor="middle" className="ph-time">
            9:41
          </text>
        )}
        {!fixed && repair === "display" && (
          <g>
            <rect x="56" y="60" width="4" height="120" fill="#35D07F" />
            <rect x="82" y="60" width="3" height="120" fill="#FF4FD8" />
            <rect x="88" y="60" width="6" height="120" fill="#4F8BFF" />
            <ellipse cx="112" cy="156" rx="18" ry="22" fill="#000" opacity=".8" />
          </g>
        )}
        {!fixed && repair === "glass" && (
          <g className="ph-cracks">
            <path d="M96 138 L70 116 L78 96 L52 76" />
            <path d="M96 138 L116 110 L108 90 L122 72" />
            <path d="M96 138 L66 148 L44 168" />
            <path d="M96 138 L108 164" />
          </g>
        )}
        {!fixed && repair === "battery" && <Battery x={80} y={120} />}
      </svg>
    );

  return (
    <svg viewBox="0 0 240 160" className={`phone art-mac ${className}`} aria-hidden="true">
      {fixed && <Wall />}
      <rect x="30" y="6" width="180" height="120" rx="10" className="ph-body" />
      <rect x="38" y="14" width="164" height="104" rx="4" className={fixed ? undefined : "ph-screen"} fill={fixed ? "url(#ph-wall)" : undefined} />
      <rect x="108" y="14" width="24" height="6" rx="3" className="ph-island" />
      <path d="M6 130h228l-9 17a8 8 0 0 1-7 5H22a8 8 0 0 1-7-5z" className="ph-body" />
      <rect x="100" y="131" width="40" height="5" rx="2.5" fill="#4a5e5f" />
      {!fixed && repair === "display" && (
        <>
          <g className="ph-cracks">
            <path d="M150 82 L112 60 L122 40 L84 22" />
            <path d="M150 82 L176 54 L168 34" />
            <path d="M150 82 L104 96 L70 112" />
            <path d="M150 82 L170 108" />
          </g>
          <rect x="60" y="14" width="3" height="104" fill="#35D07F" />
          <rect x="66" y="14" width="5" height="104" fill="#4F8BFF" />
        </>
      )}
      {!fixed && repair === "battery" && <Battery x={120} y={66} />}
      {!fixed && repair === "keyboard" && (
        <g>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={69 + col * 17}
                y={40 + row * 17}
                width="13"
                height="13"
                rx="3"
                fill={(row === 1 && col === 2) || (row === 2 && col === 4) ? "#D43B3B" : "#fff"}
                opacity={(row === 1 && col === 2) || (row === 2 && col === 4) ? 1 : 0.55}
              />
            ))
          )}
        </g>
      )}
    </svg>
  );
}
