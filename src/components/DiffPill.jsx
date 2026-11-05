import { money, signedMoney } from "../lib/format.js";

/** Differenza budget − speso: verde se resta qualcosa, rosso se si è sforato. */
export default function DiffPill({ value, neutral = false }) {
  if (Math.abs(value) < 0.005) return <span className={`pill ${neutral ? "zero" : "pos"}`}>{money(0)}</span>;
  return value > 0
    ? <span className="pill pos" title="Ancora disponibili">▲ {signedMoney(value)}</span>
    : <span className="pill neg" title="Budget sforato">▼ {signedMoney(value)}</span>;
}
