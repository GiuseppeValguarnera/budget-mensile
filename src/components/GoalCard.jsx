import { money } from "../lib/format.js";
import { savedBefore, spentOn } from "../lib/budget.js";

export default function GoalCard({ item, state, view, data }) {
  const saved = savedBefore(state, view, item.id) + spentOn(data.month, item.id);
  const pct = Math.min(100, (saved / item.goal) * 100);
  return (
    <section className="card goal" aria-label={`Obiettivo ${item.name}`}>
      <div className="card-head"><h2>{item.name}</h2><span className="sub">{Math.round(pct)}%</span></div>
      <div className="big">{money(saved)} <span className="meta">di {money(item.goal)}</span></div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><span style={{ width: `${pct}%` }} /></div>
      <div className="meta">
        {saved >= item.goal ? "Obiettivo raggiunto." : `Mancano ${money(item.goal - saved)}. Budget di questo mese: ${money(data.budgets[item.id] || 0)}.`}
      </div>
    </section>
  );
}
