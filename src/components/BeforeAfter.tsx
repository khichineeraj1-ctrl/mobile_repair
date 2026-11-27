"use client";

import { useEffect, useRef, useState } from "react";
import PhoneArt from "./PhoneArt";

// Drag across the phone to "repair" it. Plays a short demo sweep on load so
// people see it is interactive, then hands control to the user.
export default function BeforeAfter() {
  const [pos, setPos] = useState(0); // % of the phone that is repaired, from the left
  const [drag, setDrag] = useState(false);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = setTimeout(() => !touched.current && setPos(82), 500);
    const b = setTimeout(() => !touched.current && setPos(52), 1700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={box}
      className={`ba ${drag ? "drag" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label="Drag to see the screen repaired"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onPointerDown={(e) => {
        touched.current = true;
        setDrag(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture is a nicety; dragging still works without it */
        }
        move(e.clientX);
      }}
      onPointerMove={(e) => drag && move(e.clientX)}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        touched.current = true;
        setPos((p) => Math.max(0, Math.min(100, p + (e.key === "ArrowRight" ? 8 : -8))));
      }}
    >
      <PhoneArt variant="fixed" />
      <div className="ba-before" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <PhoneArt variant="glass" />
      </div>
      <div className="ba-handle" style={{ left: `${pos}%` }} />
      <span className="ba-hint">↔ Drag to repair</span>
    </div>
  );
}
