import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/data/navigation";

export default function AdminDashboard() {
  redirect(ADMIN_HOME);
}
