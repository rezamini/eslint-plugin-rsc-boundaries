"use client";

import { formatDate } from "./utils";

export function Clock() {
  return <span>{formatDate(new Date())}</span>;
}
