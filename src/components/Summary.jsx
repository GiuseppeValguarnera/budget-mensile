import AmountField from "./AmountField.jsx";
import { money, signedMoney } from "../lib/format.js";
import { monthLabel, shiftMonth, monthKey } from "../lib/months.js";

export default function Summary({ view, data, actions }) {
  const { month, carry, available, fixedTotal, toSplit, spent, balance } = data;
  const manualCarry = month.carry !== null && month.carry !== undefined;
  const positive = balance >= 0;
  const next = monthLabel(shiftMonth(view, 1));
  const prefix = view === monthKey() ? "A fine mese " : "";
  const verb = positive ? "si somma a" : "si sottrae da";

  return (
    <section className="summary" aria-label="Riepilogo del mese">
      <div className="field">
        <label htmlFor="income">Stipendio del mese</label>
        <AmountField id="income" value={month.income || ""} onCommit={actions.setIncome} />
      </div>
      <div className="field">
        <label htmlFor="carry">Riporto mese precedente</label>
        <AmountField id="carry" value={carry} allowEmpty onCommit={v => actions.setCarry(v)} />
        <div className="hint">
          {manualCarry
            ? <>Inserito a mano · <button className="linkish" type="button" onClick={() => actions.setCarry(null)}>calcola in automatico</button></>
            : "Calcolato dal saldo del mese prima"}
        </div>
      </div>
      <div className="stat">
        <span className="k">Totale disponibile</span>
        <div className="v">{money(available)}</div>
        <div className="sub">Fisse {money(fixedTotal)} · da suddividere {money(Math.max(0, toSplit))}</div>
      </div>
      <div className="stat">
        <span className="k">Speso finora</span>
        <div className="v">{money(spent)}</div>
        <div className="sub">{available > 0 ? Math.round((spent / available) * 100) : 0}% del disponibile</div>
      </div>
      <div className={`stat saldo ${positive ? "pos" : "neg"}`}>
        <span className="k">{positive ? "Eccedenza" : "Ammanco"}</span>
        <div className="v">{positive ? "▲" : "▼"} {signedMoney(balance) || money(0)}</div>
        <div className="sub">{prefix ? prefix + verb : verb.charAt(0).toUpperCase() + verb.slice(1)} {next}</div>
      </div>
    </section>
  );
}
