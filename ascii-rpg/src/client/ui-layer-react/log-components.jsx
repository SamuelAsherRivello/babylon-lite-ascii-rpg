import { useEffect, useLayoutEffect, useRef } from "react";
import { isLogScrollAtBottom } from "./log-scroll.js";

const SIGNED_NUMBER_PATTERN = /[+-]\d+(?:\.\d+)?/g;

export function renderLogEntry(entry) {
  const text = String(entry);
  const parts = text.split(SIGNED_NUMBER_PATTERN);
  const numbers = text.match(SIGNED_NUMBER_PATTERN) ?? [];
  return parts.reduce((rendered, part, index) => {
    rendered.push(part);
    const number = numbers[index];
    if (number) rendered.push(<span className={number.startsWith("+") ? "log_number_positive" : "log_number_negative"} key={`${number}-${index}`}>{number}</span>);
    return rendered;
  }, []);
}

export function LogBody({ entries }) {
  const bodyRef = useRef(null);
  const followBottomRef = useRef(true);

  useLayoutEffect(() => {
    if (followBottomRef.current && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [entries]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    const updateScrollState = () => { followBottomRef.current = isLogScrollAtBottom(body); };
    updateScrollState();
    body.addEventListener("scroll", updateScrollState, { passive: true });
    return () => body.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <div ref={bodyRef} className="log_box_body" aria-label="Log entries">
      {entries?.length ? entries.map((entry, index) => <div className="log_entry" key={`${entry}-${index}`}>{renderLogEntry(entry)}</div>) : null}
    </div>
  );
}
