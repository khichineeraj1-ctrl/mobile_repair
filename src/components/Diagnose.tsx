"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { MODELS, SERIES, getModel, inr, modelPath, quote, type DamageId, type TierId } from "@/lib/data";
import { ChooseStrip } from "./Marketplace";
import PhoneArt from "./PhoneArt";
import TierCards from "./TierCards";

type Variant = "glass" | "display" | "back" | "clean" | "fixed";
type Option = { v: string; label: string; variant: Variant; art?: ReactNode };

const line = { fill: "none", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const face = (color: string, mouth: string) => (
  <g stroke={color} {...line}>
    <path d="M36 104V92h12M72 92h12v12M84 136v12H72M48 148H36v-12" />
    <path d={`M50 110v8M70 110v8M${mouth}`} />
  </g>
);

// Every answer is a picture, so the customer matches what they see instead of reading.
const QUESTIONS: { id: string; q: string; options: Option[] }[] = [
  {
    id: "see",
    q: "What does your screen look like?",
    options: [
      { v: "cracks", label: "Cracked, picture fine", variant: "glass" },
      { v: "lines", label: "Lines or dark blotches", variant: "display" },
      {
        v: "flicker",
        label: "Flicker or green tint",
        variant: "clean",
        art: (
          <>
            <rect x="11" y="11" width="98" height="218" rx="18" fill="#35D07F" opacity="0.55" />
            <path d="M11 70h98M11 128h98M11 176h98" stroke="#fff" strokeWidth="5" opacity="0.5" />
          </>
        ),
      },
      {
        v: "black",
        label: "Black, but it still rings",
        variant: "clean",
        art: <path d="M46 136q14-16 28 0M38 122q22-26 44 0M30 108q30-36 60 0" stroke="#FF6B57" {...line} />,
      },
    ],
  },
  {
    id: "touch",
    q: "Does touch work everywhere?",
    options: [
      {
        v: "yes",
        label: "Works everywhere",
        variant: "fixed",
        art: (
          <>
            <circle cx="60" cy="140" r="26" fill="#fff" opacity="0.25" />
            <circle cx="60" cy="140" r="13" fill="#fff" />
          </>
        ),
      },
      {
        v: "partly",
        label: "Some dead zones",
        variant: "fixed",
        art: (
          <>
            <path d="M11 128h98v83a18 18 0 0 1-18 18H29a18 18 0 0 1-18-18z" fill="#0D2A2C" opacity="0.8" />
            <path d="M11 128h98" stroke="#fff" strokeWidth="4" strokeDasharray="7 7" />
          </>
        ),
      },
      {
        v: "no",
        label: "Not at all",
        variant: "clean",
        art: <path d="M40 100l40 40M80 100l-40 40" stroke="#D43B3B" {...line} strokeWidth={8} />,
      },
    ],
  },
  {
    id: "faceid",
    q: "Is Face ID still working?",
    options: [
      { v: "yes", label: "Working", variant: "clean", art: face("#35D07F", "50 130q10 8 20 0") },
      { v: "no", label: "Not working", variant: "clean", art: face("#D43B3B", "50 134q10-8 20 0") },
      { v: "na", label: "Can’t tell", variant: "clean", art: face("#7f8f87", "52 132h16") },
    ],
  },
  {
    id: "water",
    q: "Did the phone get wet when it broke?",
    options: [
      { v: "no", label: "No, it stayed dry", variant: "fixed" },
      {
        v: "yes",
        label: "Yes, or not sure",
        variant: "clean",
        art: (
          <g fill="#4F8BFF">
            <path d="M60 70q-22 30 0 44q22-14 0-44z" />
            <path d="M36 134q-13 18 0 26q13-8 0-26z" />
            <path d="M84 150q-13 18 0 26q13-8 0-26z" />
          </g>
        ),
      },
    ],
  },
];

type Answers = Record<string, string>;

function verdict(a: Answers) {
  const panel = a.see !== "cracks" || a.touch !== "yes";
  const damage: DamageId = panel ? "display" : "glass";
  const notes: string[] = [];
  if (a.water === "yes")
    notes.push("Liquid may have reached the logic board. Ask for a bench inspection before paying for a screen — a new display won’t fix board damage.");
  if (a.faceid === "no")
    notes.push("Face ID is a separate sensor paired to your phone. The technician must move your original sensor assembly to the new screen, or Face ID is lost for good.");
  if (a.see === "black") notes.push("A black screen that still rings is almost always the display. The technician will test with a known-good screen before fitting yours.");
  return panel
    ? {
        damage,
        title: "Your display panel is damaged",
        line: "The layer that makes the picture or senses touch is broken, so the full display needs replacing.",
        urgent: "It usually spreads. Back up the phone today while the screen is still usable.",
        notes,
      }
    : {
        damage,
        title: "Only the glass is broken",
        line: "Picture and touch are intact, so a cheaper glass-only repair is enough.",
        urgent: "Safe to use for now. Put on a tempered glass protector to hold the cracks together.",
        notes,
      };
}

export default function Diagnose() {
  const [answers, setAnswers] = useState<Answers>({});
  const [picked, setPicked] = useState("");
  const [series, setSeries] = useState("15");
  const [slug, setSlug] = useState("iphone-15");
  const [tier, setTier] = useState<TierId>("premium");
  const step = Object.keys(answers).length;
  const done = step === QUESTIONS.length;
  const model = getModel(slug)!;

  const segs = (
    <div className="segs" aria-hidden="true">
      {QUESTIONS.map((x, i) => (
        <i key={x.id} className={i < step ? "done" : i === step ? "on" : ""} />
      ))}
    </div>
  );

  if (!done) {
    const cur = QUESTIONS[step];
    const pick = (v: string) => {
      if (picked) return;
      setPicked(v); // flash the choice, then move on
      setTimeout(() => {
        setAnswers((a) => ({ ...a, [cur.id]: v }));
        setPicked("");
      }, 240);
    };
    return (
      <div className="card wizard">
        {segs}
        <small className="muted">
          Question {step + 1} of {QUESTIONS.length} · tap the one that matches
        </small>
        <h2 key={cur.id} className="pop">
          {cur.q}
        </h2>
        <div className={`vopts n${cur.options.length} pop`} key={cur.id + "o"}>
          {cur.options.map((o) => (
            <button key={o.v} className={`vopt ${picked === o.v ? "on" : ""}`} onClick={() => pick(o.v)}>
              <PhoneArt variant={o.variant}>{o.art}</PhoneArt>
              <b>{o.label}</b>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button
            className="link"
            onClick={() => {
              const next = { ...answers };
              delete next[QUESTIONS[step - 1].id];
              setAnswers(next);
            }}
          >
            ← Back
          </button>
        )}
      </div>
    );
  }

  const v = verdict(answers);
  return (
    <div className="card wizard pop">
      <div className="vhero">
        <PhoneArt variant={v.damage} />
        <div>
          <small className="tag">Diagnosis</small>
          <h2>{v.title}</h2>
          <p>{v.line}</p>
        </div>
      </div>
      <p className="callout">{v.urgent}</p>
      {v.notes.map((x) => (
        <p key={x} className="callout warn">
          {x}
        </p>
      ))}

      <h3>Which iPhone is it?</h3>
      <div className="rail">
        {SERIES.map((s) => (
          <button
            key={s}
            className={`chip ${s === series ? "on" : ""}`}
            onClick={() => {
              setSeries(s);
              setSlug(MODELS.find((x) => x.series === s)!.slug);
            }}
          >
            {s === "SE" ? "SE" : `${s} series`}
          </button>
        ))}
      </div>
      <div className="rail">
        {MODELS.filter((x) => x.series === series).map((x) => (
          <button key={x.slug} className={`chip chip-model ${x.slug === slug ? "on" : ""}`} onClick={() => setSlug(x.slug)}>
            {x.name.replace("iPhone ", "")}
          </button>
        ))}
      </div>

      <h3>Fixed at your doorstep for</h3>
      <TierCards kind="iphone" price={(x) => quote(model, v.damage, x)} tier={tier} onPick={setTier} />
      <p className="muted small compare">For comparison, an Apple service centre charges about {inr(quote(model, "display", "apple").lo)}.</p>

      <ChooseStrip />
      <Link className="btn wide" href={`/book?model=${slug}&damage=${v.damage}&tier=${tier}`}>
        Choose your specialist
      </Link>
      <div className="link-row">
        <button className="link" onClick={() => setAnswers({})}>
          ↺ Start again
        </button>
        <Link className="link" href={modelPath(model)}>
          {model.name} details ›
        </Link>
      </div>
    </div>
  );
}
