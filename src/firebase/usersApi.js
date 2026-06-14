// =========================================================================
// usersApi — instructor roster.
// =========================================================================
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";

// All users with the instructor role.
export async function fetchInstructors() {
  const snap = await getDocs(
    query(collection(db, "users"), where("role", "==", "instructor"))
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}
