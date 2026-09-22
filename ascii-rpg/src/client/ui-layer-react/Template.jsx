import { useState } from "react";

/**
 * Representative React UI pattern for this layer.
 * Copy the shape for new UI work; do not import this template into production.
 */
export function Template({ label = "Template", onConfirm }) {
  const [value, setValue] = useState("");

  return (
    <section className="window" aria-labelledby="template_title">
      <h2 id="template_title">{label}</h2>
      <input value={value} onChange={(event) => setValue(event.target.value)} />
      <button type="button" onClick={() => onConfirm?.(value)}>Confirm</button>
    </section>
  );
}
