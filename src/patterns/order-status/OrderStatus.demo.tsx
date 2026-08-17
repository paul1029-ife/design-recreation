"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import OrderStatus from "./OrderStatus";

/**
 * Gallery demo. The sequence plays once and stops at "Delivered", which is
 * correct for a real order and useless for a demo — so the replay button
 * remounts it with a fresh key rather than the component carrying a reset it
 * would never need in production.
 */
export default function OrderStatusDemo() {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <OrderStatus key={run} onComplete={() => setDone(true)} />
      <button
        type="button"
        onClick={() => {
          setDone(false);
          setRun((n) => n + 1);
        }}
        className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-content-subtle transition-colors hover:text-content"
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        {done ? "Play again" : "Restart"}
      </button>
    </div>
  );
}
