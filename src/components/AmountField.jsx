import { useEffect, useState } from "react";
import { parseAmount, toField } from "../lib/format.js";

/**
 * Campo per importi in formato italiano. Il valore viene confermato
 * quando si esce dal campo o si preme Invio, così il calcolo non salta a ogni tasto.
 */
export default function AmountField({ id, value, onCommit, placeholder = "0,00", allowEmpty = false, className = "" }) {
  const [text, setText] = useState(toField(value));
  useEffect(() => setText(toField(value)), [value]);

  const commit = () => {
    const n = parseAmount(text);
    if (Number.isNaN(n)) {
      if (allowEmpty) onCommit(null);
      else setText(toField(value));
      return;
    }
    onCommit(n);
  };

  return (
    <input
      id={id}
      className={className}
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}
