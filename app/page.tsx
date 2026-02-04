import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function HomePage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  // Redirect based on role
  if (user.role === "master") {
    redirect("/master")
  } else if (user.role === "admin") {
    redirect("/admin")
  } else if (user.role === "agent") {
    redirect("/agent")
  } else {
    redirect("/dashboard")
  }
}
