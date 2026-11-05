const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

/** Arrotonda ai centesimi. */
export const r2 = v => Math.round(v * 100) / 100;

const isZero = v => Math.abs(v) < 0.005;

/** 1234.5 -> "1234,50 €" */
export const money = v => eur.format(isZero(v) ? 0 : v);

/** Importo con segno: "+12,00 €" / "−12,00 €" (zero senza segno). */
export const signedMoney = v => (isZero(v) ? "" : v > 0 ? "+" : "−") + eur.format(isZero(v) ? 0 : Math.abs(v));

/** Legge importi scritti all'italiana: "1.250,50", "12,5", "12.50". Restituisce NaN se vuoto o non valido. */
export function parseAmount(input) {
  if (input === null || input === undefined) return NaN;
  const t = String(input).trim().replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return t === "" ? NaN : Number(t);
}

/** Valore da mettere in un campo di testo: 12.5 -> "12,5" */
export const toField = v => (v === null || v === undefined || v === "" ? "" : String(v).replace(".", ","));

export const newId = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
