"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, LogIn, User } from "lucide-react"
import Loader from "./Loader"

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-card border-b border-border p-6 z-40">
      <div className="flex items-center justify-between">
        <div className="ml-8 lg:ml-0">
          <h1 className="text-lg md:text-2xl font-bold text-foreground">TaskFlow</h1>
          <p className="text-xs md:text-lg text-muted-foreground mdL:mt-1">Manage your tasks efficiently</p>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="flex h-screen items-center justify-center"><Loader /></div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {session.user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => signIn("google")}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}