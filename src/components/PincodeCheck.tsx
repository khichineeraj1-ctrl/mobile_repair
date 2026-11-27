"use client";

import { useState } from "react";
import { cityByPin } from "@/lib/data";

// Prototype logic: matches the pincode prefix to a launch city. Replace with a
// real serviceability lookup once technician coverage is mapped.
export default function PincodeCheck({ onCity }: { onCity?: (slug: string) => void }) {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <>
      <form
        className="pin"
        onSubmit={(e) => {
          e.preventDefault();
          if (pin.length !== 6) return setRes({ ok: false, text: "Enter a 6-digit pincode." });
          const city = cityByPin(pin);
          if (city) onCity?.(city.slug);
          setRes(
            city
              ? { ok: true, text: `Yes, we come to your doorstep in ${city.name}.` }
              : { ok: false, text: "Not in your area yet. More cities are being added." }
          );
        }}
      >
        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
            setRes(null);
          }}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Enter your pincode"
          aria-label="Pincode"
        />
        <button className="btn" type="submit">
          Check
        </button>
      </form>
      {res && (
        <p className={`pin-res pop ${res.ok ? "ok" : "no"}`} role="status">
          {res.text}
        </p>
      )}
    </>
  );
}
