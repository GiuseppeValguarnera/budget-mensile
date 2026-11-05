const pad = n => String(n).padStart(2, "0");

/** Chiave del mese nel formato "AAAA-MM". */
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

export const todayISO = (date = new Date()) => `${monthKey(date)}-${pad(date.getDate())}`;

/** Sposta una chiave di n mesi: shiftMonth("2026-01", -1) -> "2025-12". */
export function shiftMonth(key, n) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
}

/** "2026-11" -> "Novembre 2026" */
export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "2026-11-05" -> "05/11/2026" */
export const dateLabel = iso => iso.split("-").reverse().join("/");
