import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/context"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />
  }

  return <>{children}</>
}
