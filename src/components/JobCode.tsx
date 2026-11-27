"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Four-digit code box on the technician's job page.
export default function JobCode({ id, jobKey, phase }: { id: string; jobKey: string; phase: "start" | "end" }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="codeform"
      onSubmit={async (e) => {
        e.preventDefault();
        if (code.length !== 4 || busy) return;
        setBusy(true);
        setError("");
        try {
          const res = await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, key: jobKey, code }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
          setCode("");
          router.refresh();
        } catch (err) {
          setError(err instanceof TypeError ? "No connection. Check your internet and try again." : (err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="jobcode">{phase === "start" ? "Start code from the customer" : "End code from the customer"}</label>
      <input
        id="jobcode"
        className="codeinput"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{4}"
        maxLength={4}
        placeholder="––––"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
        aria-describedby={error ? "jobcode-err" : undefined}
      />
      {error && (
        <p id="jobcode-err" className="callout warn" role="alert">
          {error}
        </p>
      )}
      <button className="btn wide" type="submit" disabled={code.length !== 4 || busy}>
        {busy ? "Checking…" : phase === "start" ? "Start the job" : "Finish the job"}
      </button>
    </form>
  );
}
