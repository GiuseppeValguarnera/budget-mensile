import { monthLabel, monthKey } from "../lib/months.js";

export default function Header({ view, saved, actions, onBackup, onRestore }) {
  return (
    <header className="top">
      <div>
        <h1>Budget Mensile</h1>
        <div className={`status ${saved ? "ok" : "warn"}`}>
          {saved ? "Dati salvati in questo browser" : "Il browser non permette di salvare: esporta un backup"}
        </div>
      </div>
      <nav className="month-nav" aria-label="Cambia mese">
        <button className="icon-btn" type="button" onClick={actions.prevMonth} aria-label="Mese precedente">‹</button>
        <div className="label" aria-live="polite">{monthLabel(view)}</div>
        <button className="icon-btn" type="button" onClick={actions.nextMonth} aria-label="Mese successivo">›</button>
        {view !== monthKey() && <button className="btn" type="button" onClick={actions.thisMonth}>Mese corrente</button>}
      </nav>
      <div className="tools">
        <button className="btn" type="button" onClick={onBackup}>Scarica backup</button>
        <button className="btn" type="button" onClick={onRestore}>Ripristina backup</button>
      </div>
    </header>
  );
}
