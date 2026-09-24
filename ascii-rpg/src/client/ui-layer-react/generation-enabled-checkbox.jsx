import { useEffect, useRef } from "react";

export function GenerationEnabledCheckbox({ title, enabled, disabled = false, mixed = false, onChange }) {
  const checkboxRef = useRef(null);
  useEffect(() => { if (checkboxRef.current) checkboxRef.current.indeterminate = mixed; }, [mixed]);
  const action = enabled ? "Disable" : "Enable";
  return <input ref={checkboxRef} className="procedural_layer_enabled" type="checkbox" checked={enabled} disabled={disabled} aria-label={disabled ? `${title} must remain enabled` : `${action} ${title}`} title={disabled ? `${title} must remain enabled` : `${action} ${title}`} onChange={onChange} />;
}
