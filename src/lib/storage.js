import { exampleState } from "./defaults.js";

const KEY = "budget-mensile-v1";

/** Carica i dati dal browser; al primo avvio mostra l'esempio. */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (isValidState(s)) return s;
    }
  } catch {
    /* storage non disponibile (es. navigazione privata): si parte dall'esempio */
  }
  return exampleState();
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function isValidState(s) {
  return !!s && typeof s === "object" && s.months && typeof s.months === "object" &&
    Object.values(s.months).every(m => Array.isArray(m.items) && Array.isArray(m.expenses));
}
