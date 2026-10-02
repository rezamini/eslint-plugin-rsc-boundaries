"use client";

import { getUser } from "./db.server.ts";

export function Profile() {
  return <div>{getUser.name}</div>;
}
