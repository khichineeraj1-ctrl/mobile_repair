"use client";

import { tierInfo, type DeviceKind } from "@/lib/catalog";
import { range, type Quote, type TierId } from "@/lib/data";

const DOOR_TIERS: TierId[] = ["premium", "budget"]; // Apple repairs are not done at the doorstep

type Props = { kind: DeviceKind; price: (t: TierId) => Quote; tier: TierId; onPick: (t: TierId) => void };

// The two part grades that can be fitted at the doorstep, as tappable rows.
export default function TierCards({ kind, price, tier, onPick }: Props) {
  return (
    <div className="tcards">
      {DOOR_TIERS.map((id) => {
        const x = tierInfo(kind, id);
        return (
          <button type="button" key={id} className={`tcard ${id === tier ? "on" : ""}`} onClick={() => onPick(id)} aria-pressed={id === tier}>
            <i className="radio" aria-hidden="true" />
            <span className="tinfo">
              <b>{x.short}</b>
              <small>
                {x.part} · {x.warranty} warranty
              </small>
            </span>
            <span className="tprice">{range(price(id))}</span>
          </button>
        );
      })}
    </div>
  );
}
