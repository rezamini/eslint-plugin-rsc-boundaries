import type { useState } from "react";

type Setter = typeof useState;

export function Page(_props: { tip?: Setter }) {
  return <div>ok</div>;
}
