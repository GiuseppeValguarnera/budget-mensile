import { useCallback, useEffect, useMemo, useState } from "react";
import { loadState, saveState } from "../lib/storage.js";
import { ensureMonth, computeMonth } from "../lib/budget.js";
import { monthKey, shiftMonth, todayISO } from "../lib/months.js";
import { emptyState } from "../lib/defaults.js";
import { newId, r2 } from "../lib/format.js";

/** Stato dell'app, salvataggio nel browser e tutte le azioni che lo modificano. */
export function useBudget() {
  const [view, setView] = useState(monthKey);
  const [state, setState] = useState(() => ensureMonth(loadState(), monthKey()));
  const [saved, setSaved] = useState(true);

  useEffect(() => setSaved(saveState(state)), [state]);

  /** Applica una modifica su una copia dello stato. touch=true toglie il segno di "dati di esempio". */
  const update = useCallback((fn, touch = true) => {
    setState(s => {
      const next = structuredClone(s);
      fn(next);
      if (touch) next.example = false;
      return next;
    });
  }, []);

  const goTo = useCallback(key => {
    setState(s => ensureMonth(s, key));
    setView(key);
  }, []);

  const month = () => s => s.months[view];
  const dateForView = view === monthKey() ? todayISO() : `${view}-01`;

  /** Le modifiche alle voci valgono dal mese visualizzato in avanti; i mesi passati restano com'erano. */
  const forEachMonthFromView = (s, fn) => Object.keys(s.months).filter(k => k >= view).forEach(k => fn(s.months[k]));

  const actions = {
    prevMonth: () => goTo(shiftMonth(view, -1)),
    nextMonth: () => goTo(shiftMonth(view, 1)),
    thisMonth: () => goTo(monthKey()),
    setIncome: v => update(s => { month()(s).income = r2(Math.max(0, v || 0)); }),
    setCarry: v => update(s => { month()(s).carry = v === null ? null : r2(v); }),
    addExpense: ({ item, amount, date, note }) =>
      update(s => { month()(s).expenses.push({ id: newId(), item, amount: r2(amount), date: date || dateForView, note: note || "" }); }),
    removeExpense: id => update(s => { const m = month()(s); m.expenses = m.expenses.filter(e => e.id !== id); }),
    markPaid: item =>
      update(s => { const m = month()(s); const it = m.items.find(i => i.id === item); if (it) m.expenses.push({ id: newId(), item, amount: it.amount, date: dateForView, note: "Pagato" }); }),
    editItem: (id, patch) =>
      update(s => forEachMonthFromView(s, m => { const it = m.items.find(i => i.id === id); if (it) patch(it); })),
    addItem: (name, kind) => {
      const item = kind === "fixed" ? { id: newId(), name, kind, amount: 0 } : { id: newId(), name, kind: "var", weight: 3, min: 0, max: null };
      update(s => forEachMonthFromView(s, m => m.items.push(structuredClone(item))));
    },
    deleteItem: id =>
      update(s => forEachMonthFromView(s, m => { m.items = m.items.filter(i => i.id !== id); m.expenses = m.expenses.filter(e => e.item !== id); })),
    clearExample: () => { const k = monthKey(); setState(emptyState(k)); setView(k); },
    importState: s => { const k = monthKey(); setState(ensureMonth({ ...s, example: false }, k)); setView(k); }
  };

  const data = useMemo(() => computeMonth(state, view), [state, view]);
  return { state, view, data, saved, actions };
}
