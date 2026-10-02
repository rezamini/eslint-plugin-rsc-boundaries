"use client";

import { helper } from "./db.serverish";
import { ok } from "./servers";

export function Box() {
  return <div>{helper}{ok}</div>;
}
