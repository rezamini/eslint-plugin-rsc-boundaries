"use client";

import { getUser } from "./db.server";

export function Profile() {
  return <div>{getUser.name}</div>;
}
