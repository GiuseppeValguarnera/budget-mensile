import { forwardRef, useEffect, useState } from "react";
import { parseAmount } from "../lib/format.js";

const AddExpense = forwardRef(function AddExpense({ items, selected, onSelect, defaultDate, onAdd }, amountRef) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setDate(defaultDate), [defaultDate]);

  const submit = e => {
    e.preventDefault();
    const n = parseAmount(amount);
    if (Number.isNaN(n) || n <= 0) {
      setError("Scrivi un importo maggiore di zero, ad esempio 12,50.");
      return;
    }
    onAdd({ item: selected, amount: n, date, note: note.trim() });
    setAmount("");
    setNote("");
    setError("");
    amountRef.current?.focus();
  };

  return (
    <section className="card" aria-label="Aggiungi spesa">
      <h2>Aggiungi spesa</h2>
      <form className="add" onSubmit={submit} noValidate>
        <div className="f">
          <label htmlFor="e-item">Voce</label>
          <select id="e-item" value={selected} onChange={e => onSelect(e.target.value)}>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="frow">
          <div className="f">
            <label htmlFor="e-amt">Importo €</label>
            <input id="e-amt" ref={amountRef} inputMode="decimal" autoComplete="off" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="f">
            <label htmlFor="e-date">Data</label>
            <input id="e-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="f">
          <label htmlFor="e-note">Nota (facoltativa)</label>
          <input id="e-note" placeholder="es. Pieno al distributore" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        {error && <p className="msg err" role="alert">{error}</p>}
        <button className="btn primary" type="submit">Registra spesa</button>
      </form>
    </section>
  );
});

export default AddExpense;
