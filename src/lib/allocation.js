/**
 * Suddivisione automatica del budget.
 *
 * 1. Ogni voce riceve il suo minimo (la benzina riceve costo × pieni).
 *    Se il denaro non basta per tutti i minimi, questi vengono ridotti in proporzione.
 * 2. Il resto viene diviso in proporzione alla priorità (weight).
 *    Una voce che raggiunge il massimo si ferma e la sua parte in eccesso
 *    torna alle altre voci ("water filling"), finché il denaro finisce
 *    o tutte le voci sono al massimo.
 * 3. Gli importi vengono arrotondati all'euro senza cambiare il totale
 *    (metodo dei resti più grandi).
 */

/** Limiti effettivi di una voce variabile. savedBefore = quanto già accumulato per un obiettivo. */
export function itemBounds(item, savedBefore = 0) {
  if (item.fuel) {
    const v = Math.max(0, (item.fuel.cost || 0) * (item.fuel.fills || 1));
    return { id: item.id, min: v, max: v, weight: 0 };
  }
  let min = Math.max(0, item.min || 0);
  let max = item.max === null || item.max === undefined || item.max === "" ? Infinity : Math.max(0, item.max);
  if (item.goal) {
    const left = Math.max(0, item.goal - savedBefore);
    max = Math.min(max, left);
    min = Math.min(min, left);
  }
  if (max < min) max = min;
  return { id: item.id, min, max, weight: Math.max(0, item.weight || 0) };
}

/** Arrotonda all'euro intero mantenendo la somma uguale a Math.round(total). */
export function roundToEuros(values, total) {
  const keys = Object.keys(values);
  const parts = keys.map(k => ({ k, floor: Math.floor(values[k]), rest: values[k] - Math.floor(values[k]) }));
  let missing = Math.round(total) - parts.reduce((a, p) => a + p.floor, 0);
  parts.sort((a, b) => b.rest - a.rest);
  const out = {};
  for (const p of parts) out[p.k] = p.floor + (missing-- > 0 ? 1 : 0);
  return out;
}

/**
 * @param {{id:string,min:number,max:number,weight:number}[]} bounds
 * @param {number} available denaro da dividere
 * @returns {{budgets: Record<string, number>, unassigned: number, minimumsCut: boolean}}
 */
export function allocate(bounds, available) {
  const raw = Object.fromEntries(bounds.map(b => [b.id, 0]));
  if (available <= 0) return { budgets: raw, unassigned: 0, minimumsCut: false };

  const sumMin = bounds.reduce((a, b) => a + b.min, 0);
  if (available <= sumMin) {
    for (const b of bounds) raw[b.id] = sumMin > 0 ? (b.min * available) / sumMin : 0;
    return { budgets: roundToEuros(raw, available), unassigned: 0, minimumsCut: available < sumMin };
  }

  for (const b of bounds) raw[b.id] = b.min;
  let rest = available - sumMin;
  let active = bounds.filter(b => b.weight > 0 && b.max > b.min);

  while (rest > 0.0001 && active.length) {
    const totalWeight = active.reduce((a, b) => a + b.weight, 0);
    const stillOpen = [];
    let given = 0;
    for (const b of active) {
      const share = (rest * b.weight) / totalWeight;
      const room = b.max - raw[b.id];
      if (share >= room) {
        raw[b.id] += room;
        given += room;
      } else {
        raw[b.id] += share;
        given += share;
        stillOpen.push(b);
      }
    }
    rest -= given;
    if (stillOpen.length === active.length) rest = 0; // nessuno ha toccato il tetto: tutto distribuito
    active = stillOpen;
  }

  const unassigned = Math.max(0, rest);
  return {
    budgets: roundToEuros(raw, available - unassigned),
    unassigned: Math.round(unassigned * 100) / 100,
    minimumsCut: false
  };
}
