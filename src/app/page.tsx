import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
