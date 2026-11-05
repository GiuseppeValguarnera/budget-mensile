import { money } from "../lib/format.js";
import { dateLabel } from "../lib/months.js";

export default function Movements({ month, onRemove }) {
  const list = [...month.expenses].sort((a, b) => b.date.localeCompare(a.date));
  const nameOf = id => month.items.find(i => i.id === id)?.name ?? "Voce eliminata";
  return (
    <section className="card" aria-label="Movimenti del mese">
      <div className="card-head"><h2>Movimenti</h2><span className="sub">{list.length} nel mese</span></div>
      <div className="moves">
        {list.length === 0 && <div className="empty">Nessuna spesa registrata in questo mese.</div>}
        {list.map(e => (
          <div className="move" key={e.id}>
            <div>
              <div>{nameOf(e.item)}{e.note && <span className="meta"> · {e.note}</span>}</div>
              <div className="d">{dateLabel(e.date)}</div>
            </div>
            <div>{money(e.amount)}</div>
            <button className="x" type="button" onClick={() => onRemove(e.id)} aria-label={`Elimina ${nameOf(e.item)} ${money(e.amount)}`}>×</button>
          </div>
        ))}
      </div>
    </section>
  );
}
