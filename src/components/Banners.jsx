import { money } from "../lib/format.js";

export default function Banners({ example, data, onClearExample }) {
  return (
    <>
      {example && (
        <div className="banner">
          <span>Stai vedendo <strong>valori di esempio</strong>. Inserisci i tuoi dati oppure riparti da zero.</span>
          <button className="btn" type="button" onClick={onClearExample}>Riparti da zero</button>
        </div>
      )}
      {data.toSplit < 0 && (
        <div className="banner alert" role="alert">
          <span>Le spese fisse superano il disponibile di <strong>{money(-data.toSplit)}</strong>: alle voci variabili non resta nulla.</span>
        </div>
      )}
      {data.minimumsCut && (
        <div className="banner alert" role="alert">
          <span>Il disponibile non copre tutti i minimi (benzina, tabacco, spesa…): sono stati ridotti in proporzione.</span>
        </div>
      )}
      {data.unassigned > 0.5 && (
        <div className="banner">
          <span><strong>{money(data.unassigned)}</strong> non sono assegnati perché tutte le voci hanno raggiunto il massimo. Alza una priorità o togli un massimo.</span>
        </div>
      )}
    </>
  );
}
