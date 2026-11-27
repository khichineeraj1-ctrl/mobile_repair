import { ImageResponse } from "next/og";
import { SITE } from "@/lib/data";

// The picture shown when any page is shared on WhatsApp, X, LinkedIn and so on.
export const alt = `${SITE.name}: choose your Apple repair specialist, repaired at your doorstep`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0D2A2C", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 700 }}>
          <div style={{ width: 30, height: 50, border: "5px solid #FF6B57", borderRadius: 9, marginRight: 18 }} />
          Screen<span style={{ color: "#FF6B57" }}>Sahi</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Apple repair at your doorstep.</div>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#FF6B57" }}>You choose the specialist.</div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#c3d1ca" }}>iPhone · iPad · MacBook · Apple Watch — pay after the repair</div>
      </div>
    ),
    size
  );
}
