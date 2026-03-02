import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION, so we rely on
    // it for the initial state instead of getSession() (which reads local cache).
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    // getUser() makes a server-side request to verify the token is still valid.
    // This detects deleted users whose JWT hasn't expired yet (local cache would
    // still show them as logged in). If the check fails, sign out locally only
    // (scope: "local") since the user no longer exists on the server.
    supabase.auth.getUser().then(({ error }) => {
      if (error) {
        supabase.auth.signOut({ scope: "local" })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
