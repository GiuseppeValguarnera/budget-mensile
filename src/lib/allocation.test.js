import { describe, it, expect } from "vitest";
import { allocate, itemBounds, roundToEuros } from "./allocation.js";
import { computeMonth, carryOf, ensureMonth } from "./budget.js";
import { exampleState, defaultItems } from "./defaults.js";
import { parseAmount } from "./format.js";

const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

describe("allocate", () => {
  it("rispetta minimi, massimi e priorità e distribuisce tutto", () => {
    const b = [
      { id: "a", min: 50, max: 50, weight: 0 },
      { id: "b", min: 100, max: 150, weight: 8 },
      { id: "c", min: 0, max: Infinity, weight: 1 },
      { id: "d", min: 0, max: Infinity, weight: 3 }
    ];
    const { budgets, unassigned } = allocate(b, 600);
    expect(budgets.a).toBe(50);
    expect(budgets.b).toBe(150);
    expect(budgets.c).toBe(100);
    expect(budgets.d).toBe(300);
    expect(unassigned).toBe(0);
    expect(sum(budgets)).toBe(600);
  });

  it("riduce i minimi in proporzione se il denaro non basta", () => {
    const r = allocate([{ id: "a", min: 100, max: 100, weight: 0 }, { id: "b", min: 300, max: Infinity, weight: 1 }], 200);
    expect(r.minimumsCut).toBe(true);
    expect(r.budgets).toEqual({ a: 50, b: 150 });
  });

  it("segnala il denaro non assegnabile quando tutte le voci sono al massimo", () => {
    const r = allocate([{ id: "a", min: 0, max: 100, weight: 1 }], 250);
    expect(r.budgets.a).toBe(100);
    expect(r.unassigned).toBe(150);
  });

  it("con denaro zero o negativo non assegna nulla", () => {
    expect(allocate([{ id: "a", min: 10, max: 10, weight: 0 }], -5).budgets.a).toBe(0);
  });
});

describe("itemBounds", () => {
  it("benzina = costo × pieni", () => {
    expect(itemBounds({ id: "b", fuel: { cost: 55, fills: 2 } })).toMatchObject({ min: 110, max: 110 });
  });
  it("l'obiettivo non supera quanto manca", () => {
    expect(itemBounds({ id: "pc", weight: 5, goal: 2000 }, 1900).max).toBe(100);
  });
});

describe("roundToEuros", () => {
  it("mantiene il totale", () => {
    const r = roundToEuros({ a: 33.33, b: 33.33, c: 33.34 }, 100);
    expect(sum(r)).toBe(100);
  });
});

describe("mesi", () => {
  it("l'esempio assegna esattamente il disponibile", () => {
    const s = exampleState("2026-11");
    const c = computeMonth(s, "2026-11");
    expect(sum(c.budgets)).toBe(1400);
    expect(c.balance).toBe(1400 - 720.7);
  });

  it("l'eccedenza passa al mese successivo", () => {
    let s = exampleState("2026-11");
    s = ensureMonth(s, "2026-12");
    expect(carryOf(s, "2026-12")).toBeCloseTo(679.3);
    expect(s.months["2026-12"].items).toHaveLength(defaultItems().length);
  });
});

describe("parseAmount", () => {
  it("capisce il formato italiano", () => {
    expect(parseAmount("1.250,50")).toBe(1250.5);
    expect(parseAmount("12,5")).toBe(12.5);
    expect(parseAmount("12.50")).toBe(12.5);
    expect(parseAmount("")).toBeNaN();
  });
});
