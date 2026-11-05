import { allocate, itemBounds } from "./allocation.js";
import { shiftMonth } from "./months.js";
import { defaultItems } from "./defaults.js";
import { r2 } from "./format.js";

export const spentOn = (month, itemId) => month.expenses.reduce((a, e) => a + (e.item === itemId ? e.amount : 0), 0);
export const spentTotal = month => month.expenses.reduce((a, e) => a + e.amount, 0);

/** Totale messo da parte per un obiettivo nei mesi precedenti a `key`. */
export function savedBefore(state, key, itemId) {
  return Object.entries(state.months).reduce((a, [k, m]) => (k < key ? a + spentOn(m, itemId) : a), 0);
}

/** Riporto: quello inserito a mano, altrimenti il saldo del mese precedente (se esiste). */
export function carryOf(state, key, depth = 0) {
  const m = state.months[key];
  if (!m) return 0;
  if (m.carry !== null && m.carry !== undefined) return m.carry;
  const prev = shiftMonth(key, -1);
  return state.months[prev] && depth < 120 ? balanceOf(state, prev, depth + 1) : 0;
}

/** Saldo del mese: disponibile (stipendio + riporto) meno speso. */
export function balanceOf(state, key, depth = 0) {
  const m = state.months[key];
  if (!m) return 0;
  return r2(carryOf(state, key, depth) + (m.income || 0) - spentTotal(m));
}

/** Crea il mese se manca, copiando voci e stipendio dal mese più vicino. Restituisce un nuovo stato. */
export function ensureMonth(state, key) {
  if (state.months[key]) return state;
  const keys = Object.keys(state.months).sort();
  const before = keys.filter(k => k < key).pop();
  const source = state.months[before || keys.find(k => k > key)];
  const month = {
    income: source ? source.income || 0 : 0,
    carry: null,
    items: source ? structuredClone(source.items) : defaultItems(),
    expenses: []
  };
  return { ...state, months: { ...state.months, [key]: month } };
}

/** Tutti i numeri che servono alla schermata di un mese. */
export function computeMonth(state, key) {
  const month = state.months[key];
  const carry = carryOf(state, key);
  const available = r2((month.income || 0) + carry);
  const fixed = month.items.filter(i => i.kind === "fixed");
  const variable = month.items.filter(i => i.kind !== "fixed");
  const fixedTotal = fixed.reduce((a, i) => a + (i.amount || 0), 0);
  const toSplit = r2(available - fixedTotal);

  const result = allocate(variable.map(i => itemBounds(i, savedBefore(state, key, i.id))), toSplit);
  const budgets = { ...result.budgets };
  for (const i of fixed) budgets[i.id] = i.amount || 0;

  const spent = r2(spentTotal(month));
  return {
    month, carry, available, fixed, variable, fixedTotal, toSplit, budgets,
    unassigned: result.unassigned,
    minimumsCut: result.minimumsCut,
    spent,
    balance: r2(available - spent)
  };
}
