import { useRef, useState } from "react";
import { useBudget } from "./hooks/useBudget.js";
import { isValidState } from "./lib/storage.js";
import { monthKey, todayISO } from "./lib/months.js";
import Header from "./components/Header.jsx";
import Banners from "./components/Banners.jsx";
import Summary from "./components/Summary.jsx";
import ItemsTable from "./components/ItemsTable.jsx";
import AddExpense from "./components/AddExpense.jsx";
import GoalCard from "./components/GoalCard.jsx";
import Movements from "./components/Movements.jsx";
import ConfigPanel from "./components/ConfigPanel.jsx";

export default function App() {
  const { state, view, data, saved, actions } = useBudget();
  const [selected, setSelected] = useState("spesa");
  const [notice, setNotice] = useState("");
  const amountRef = useRef(null);
  const fileRef = useRef(null);

  const items = [...data.fixed, ...data.variable];
  const current = items.some(i => i.id === selected) ? selected : items[0]?.id ?? "";

  const focusAdd = id => {
    setSelected(id);
    amountRef.current?.focus();
    amountRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const backup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `budget-mensile-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const s = JSON.parse(await file.text());
      if (!isValidState(s)) throw new Error("formato");
      actions.importState(s);
      setNotice("Backup ripristinato.");
    } catch {
      setNotice("Questo file non è un backup di Budget Mensile. Scegli il file .json scaricato con «Scarica backup».");
    }
  };

  return (
    <div className="wrap">
      <Header view={view} saved={saved} actions={actions} onBackup={backup} onRestore={() => fileRef.current?.click()} />
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restore} />
      {notice && (
        <div className="banner" role="status">
          <span>{notice}</span>
          <button className="btn" type="button" onClick={() => setNotice("")}>Chiudi</button>
        </div>
      )}
      <Banners example={state.example} data={data} onClearExample={actions.clearExample} />
      <Summary view={view} data={data} actions={actions} />

      <div className="grid2">
        <ItemsTable data={data} onAdd={focusAdd} onPaid={actions.markPaid} />
        <div className="side">
          <AddExpense
            ref={amountRef}
            items={items}
            selected={current}
            onSelect={setSelected}
            defaultDate={view === monthKey() ? todayISO() : `${view}-01`}
            onAdd={actions.addExpense}
          />
          {data.variable.filter(i => i.goal).map(i => <GoalCard key={i.id} item={i} state={state} view={view} data={data} />)}
          <Movements month={data.month} onRemove={actions.removeExpense} />
        </div>
      </div>

      <ConfigPanel view={view} data={data} actions={actions} />
      <footer className="msg">
        I dati restano solo in questo browser: nessun account, nessun server. Usa «Scarica backup» per conservarli o spostarli su un altro dispositivo.
      </footer>
    </div>
  );
}
