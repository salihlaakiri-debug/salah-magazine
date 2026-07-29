"use client";

import { useId } from "react";

export default function Honeypot() {
  const id = useId();
  return (
    <input
      type="text"
      name={`hp_${id}`}
      id={`hp_${id}`}
      tabIndex={-1}
      autoComplete="off"
      style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0, zIndex: -1 }}
      aria-hidden="true"
    />
  );
}
