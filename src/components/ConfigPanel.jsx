import { useState } from "react";
import AmountField from "./AmountField.jsx";
import { monthLabel } from "../lib/months.js";

function WeightSlider({ item, onChange }) {
  const [w, setW] = useState(item.weight || 0);
  return (
    <div className="f">
      <label htmlFor={`w-${item.id}`}>Priorità: {w}</label>
      <input
        id={`w-${item.id}`}
        type="range" min="0" max="10" step="1"
        value={w}
        onChange={e => setW(Number(e.target.value))}
        onPointerUp={() => onChange(w)}
        onKeyUp={() => onChange(w)}
        onBlur={() => w !== item.weight && onChange(w)}
      />
    </div>
  );
}

function ItemConfig({ item, actions }) {
  const [confirming, setConfirming] = useState(false);
  const edit = patch => actions.editItem(item.id, patch);
  const nonNeg = v => Math.max(0, v || 0);

  const nameField = (
    <div className="f nm">
      <label htmlFor={`n-${item.id}`}>{item.kind === "fixed" ? "Voce fissa" : "Voce variabile"}</label>
      <input
        id={`n-${item.id}`}
        defaultValue={item.name}
        onBlur={e => { const v = e.target.value.trim(); if (v && v !== item.name) edit(it => { it.name = v; }); }}
      />
    </div>
  );
  const deleteButton = (
    <button
      className="del" type="button"
      onClick={() => (confirming ? actions.deleteItem(item.id) : setConfirming(true))}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? "Conferma: elimina anche le spese" : "Elimina"}
    </button>
  );

  if (item.kind === "fixed") {
    return (
      <div className="cfg fixed">
        {nameField}
        <div className="f">
          <label htmlFor={`a-${item.id}`}>Importo mensile €</label>
          <AmountField id={`a-${item.id}`} value={item.amount || 0} onCommit={v => edit(it => { it.amount = nonNeg(v); })} />
        </div>
        {deleteButton}
      </div>
    );
  }

  if (item.fuel) {
    return (
      <div className="cfg">
        {nameField}
        <div className="f">
          <label htmlFor={`fc-${item.id}`}>Costo di un pieno €</label>
          <AmountField id={`fc-${item.id}`} value={item.fuel.cost} onCommit={v => edit(it => { it.fuel.cost = nonNeg(v); })} />
        </div>
        <div className="f">
          <label htmlFor={`ff-${item.id}`}>Pieni al mese</label>
          <select id={`ff-${item.id}`} value={item.fuel.fills} onChange={e => edit(it => { it.fuel.fills = Number(e.target.value); })}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="f"><span className="tag">Riservato prima della suddivisione</span></div>
        <div />
        {deleteButton}
      </div>
    );
  }

  return (
    <div className="cfg">
      {nameField}
      <WeightSlider item={item} onChange={w => edit(it => { it.weight = w; })} />
      <div className="f">
        <label htmlFor={`mi-${item.id}`}>Minimo €</label>
        <AmountField id={`mi-${item.id}`} value={item.min || ""} placeholder="0" allowEmpty onCommit={v => edit(it => { it.min = nonNeg(v); })} />
      </div>
      <div className="f">
        <label htmlFor={`ma-${item.id}`}>Massimo €</label>
        <AmountField id={`ma-${item.id}`} value={item.max ?? ""} placeholder="nessuno" allowEmpty onCommit={v => edit(it => { it.max = v === null ? null : nonNeg(v); })} />
      </div>
      <div className="f">
        <label htmlFor={`g-${item.id}`}>Obiettivo totale €</label>
        <AmountField id={`g-${item.id}`} value={item.goal ?? ""} placeholder="nessuno" allowEmpty onCommit={v => edit(it => { if (!v || v <= 0) delete it.goal; else it.goal = v; })} />
      </div>
      {deleteButton}
    </div>
  );
}

export default function ConfigPanel({ view, data, actions }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("var");
  const add = () => {
    if (!name.trim()) return;
    actions.addItem(name.trim(), kind);
    setName("");
  };

  return (
    <details className="config">
      <summary>Configura voci e suddivisione</summary>
      <div className="config-body">
        <p>
          Quello che resta dopo le spese fisse viene diviso così: prima la benzina (costo × pieni) e i minimi di ogni voce,
          poi il resto in proporzione alla priorità, senza superare i massimi. Se minimo e massimo coincidono la voce riceve
          quella cifra (es. tabacco circa 50 €). L'obiettivo smette di ricevere soldi quando il totale è raggiunto.
          Le modifiche valgono da {monthLabel(view)} in poi.
        </p>
        <div className="cfg-list">
          {[...data.fixed, ...data.variable].map(i => <ItemConfig key={`${view}-${i.id}`} item={i} actions={actions} />)}
        </div>
        <div className="newitem">
          <div className="f">
            <label htmlFor="ni-name">Nuova voce</label>
            <input id="ni-name" placeholder="es. Palestra" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
          </div>
          <div className="f">
            <label htmlFor="ni-kind">Tipo</label>
            <select id="ni-kind" value={kind} onChange={e => setKind(e.target.value)}>
              <option value="var">Variabile</option>
              <option value="fixed">Fissa</option>
            </select>
          </div>
          <button className="btn" type="button" onClick={add}>Aggiungi voce</button>
        </div>
      </div>
    </details>
  );
}
