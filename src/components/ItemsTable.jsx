import DiffPill from "./DiffPill.jsx";
import { money, r2 } from "../lib/format.js";
import { spentOn } from "../lib/budget.js";

function describe(item) {
  if (item.kind === "fixed") return "Fissa";
  if (item.fuel) return `${item.fuel.fills} ${item.fuel.fills > 1 ? "pieni" : "pieno"} da ${money(item.fuel.cost)}`;
  const parts = [];
  const exact = item.min && item.max != null && item.min === item.max;
  if (exact) parts.push(`circa ${money(item.min)}`);
  else {
    if (item.min) parts.push(`min ${money(item.min)}`);
    if (item.max != null && item.max !== "") parts.push(`max ${money(item.max)}`);
    parts.push(`priorità ${item.weight || 0}`);
  }
  if (item.goal) parts.push(`obiettivo ${money(item.goal)}`);
  return parts.join(" · ");
}

function Row({ item, data, onAdd, onPaid }) {
  const budget = data.budgets[item.id] || 0;
  const spent = spentOn(data.month, item.id);
  const diff = r2(budget - spent);
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0;
  const over = spent > budget + 0.004;
  return (
    <div className="trow">
      <div className="cell-name">
        <div className="name">{item.name}</div>
        <div className="meta">{describe(item)}</div>
        <div className={`bar ${over ? "over" : ""}`} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        {item.kind === "fixed" && spent === 0 && budget > 0 && (
          <button className="paid-btn" type="button" onClick={() => onPaid(item.id)}>Segna come pagata</button>
        )}
      </div>
      <div className="num" data-l="Budget">{money(budget)}</div>
      <div className="num" data-l="Speso">{money(spent)}</div>
      <div className="num" data-l="Differenza"><DiffPill value={diff} neutral={budget === 0 && spent === 0} /></div>
      <div>
        <button className="add-mini" type="button" onClick={() => onAdd(item.id)} aria-label={`Aggiungi spesa a ${item.name}`}>+</button>
      </div>
    </div>
  );
}

export default function ItemsTable({ data, onAdd, onPaid }) {
  const { fixed, variable, budgets, month } = data;
  const sumBudget = list => list.reduce((a, i) => a + (budgets[i.id] || 0), 0);
  const sumSpent = list => list.reduce((a, i) => a + spentOn(month, i.id), 0);
  const all = [...fixed, ...variable];

  return (
    <section className="card" aria-label="Voci di spesa">
      <div className="card-head">
        <h2>Voci</h2>
        <span className="sub">Verde: sei dentro il budget · Rosso: hai sforato</span>
      </div>
      <div className="table">
        <div className="trow head"><div>Voce</div><div className="num">Budget</div><div className="num">Speso</div><div className="num">Differenza</div><div /></div>
        <div className="trow group"><div>Spese fisse</div><div>{money(sumBudget(fixed))}</div></div>
        {fixed.length ? fixed.map(i => <Row key={i.id} item={i} data={data} onAdd={onAdd} onPaid={onPaid} />) : <div className="empty">Nessuna voce fissa.</div>}
        <div className="trow group"><div>Spese variabili</div><div>{money(sumBudget(variable))}</div></div>
        {variable.length ? variable.map(i => <Row key={i.id} item={i} data={data} onAdd={onAdd} onPaid={onPaid} />) : <div className="empty">Nessuna voce variabile.</div>}
        <div className="trow total">
          <div className="cell-name">Totale voci</div>
          <div className="num" data-l="Budget">{money(sumBudget(all))}</div>
          <div className="num" data-l="Speso">{money(sumSpent(all))}</div>
          <div className="num" data-l="Differenza"><DiffPill value={r2(sumBudget(all) - sumSpent(all))} /></div>
          <div />
        </div>
      </div>
    </section>
  );
}
