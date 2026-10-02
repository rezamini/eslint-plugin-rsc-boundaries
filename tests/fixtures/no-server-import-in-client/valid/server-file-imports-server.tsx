import db from "./db.server.ts";
import "server-only";

export async function getUser() {
  return db.user.findFirst();
}
