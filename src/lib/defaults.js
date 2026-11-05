import { monthKey } from "./months.js";
import { newId } from "./format.js";

/**
 * Voci di partenza.
 * kind "fixed": importo fisso ogni mese.
 * kind "var": riceve una parte di ciò che resta, secondo priorità (weight), minimo e massimo.
 * fuel: voce a rifornimenti, riservata come costo × numero di pieni.
 * goal: obiettivo totale da accumulare su più mesi.
 */
export function defaultItems() {
  return [
    { id: "affitto", name: "Affitto", kind: "fixed", amount: 0 },
    { id: "finanziamento", name: "Finanziamento", kind: "fixed", amount: 0 },
    { id: "telefono", name: "Telefono", kind: "fixed", amount: 0 },
    { id: "benzina", name: "Benzina", kind: "var", weight: 0, min: 0, max: null, fuel: { cost: 50, fills: 1 } },
    { id: "spesa", name: "Spesa", kind: "var", weight: 8, min: 100, max: 150 },
    { id: "tabacco", name: "Tabacco", kind: "var", weight: 0, min: 50, max: 50 },
    { id: "emergenze", name: "Fondo emergenze", kind: "var", weight: 5, min: 0, max: null },
    { id: "auto", name: "Auto e manutenzione", kind: "var", weight: 4, min: 0, max: null },
    { id: "risparmio", name: "Risparmio", kind: "var", weight: 5, min: 0, max: null },
    { id: "obiettivo", name: "Obiettivo: PC nuovo", kind: "var", weight: 7, min: 0, max: null, goal: 2000 },
    { id: "vacanza", name: "Vacanza", kind: "var", weight: 3, min: 0, max: null },
    { id: "uscite", name: "Uscite", kind: "var", weight: 3, min: 0, max: null },
    { id: "shopping", name: "Shopping", kind: "var", weight: 2, min: 0, max: null }
  ];
}

export function emptyState(key = monthKey()) {
  return { version: 1, example: false, months: { [key]: { income: 0, carry: null, items: defaultItems(), expenses: [] } } };
}

/** Stato dimostrativo mostrato al primo avvio, chiaramente segnalato nell'interfaccia. */
export function exampleState(key = monthKey()) {
  const items = defaultItems().map(i =>
    i.kind === "fixed" ? { ...i, amount: { affitto: 450, finanziamento: 180, telefono: 15 }[i.id] } : i
  );
  const e = (item, amount, day, note = "") => ({ id: newId(), item, amount, date: `${key}-${day}`, note });
  return {
    version: 1,
    example: true,
    months: {
      [key]: {
        income: 1400,
        carry: null,
        items,
        expenses: [
          e("affitto", 450, "01", "Pagato"),
          e("spesa", 92.4, "02", "Supermercato"),
          e("benzina", 50, "03", "Pieno"),
          e("tabacco", 22, "03"),
          e("spesa", 71.3, "04", "Supermercato"),
          e("uscite", 35, "04", "Pizza con amici")
        ]
      }
    }
  };
}
