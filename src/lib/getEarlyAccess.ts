import { checkRole } from "~/utils/roles";

export async function isAdmin() {
  const isAdmin = await checkRole("admin");
  return isAdmin;
}

export async function isBetaTester() {
  const isBetaTester = await checkRole("betaTester");
  return isBetaTester;
}
