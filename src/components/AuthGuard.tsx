"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Loader from "./Loader"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin") 
    }
  }, [status, router, session])

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center"><Loader /></div>
  }

  return <>{children}</>
}
