import { checkRole } from "~/utils/roles";

async function isAdmin() {
  const isAdmin = await checkRole("admin");
  return isAdmin;
}

export default isAdmin;
