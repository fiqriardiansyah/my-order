import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { signinSchema, type SigninFormValues } from "../schemas/signin.schema"

export function SigninForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
  })

  async function onSubmit(values: SigninFormValues) {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setIsLoading(false)

    if (error) {
      toast.error("Sign in failed", { description: error.message })
      return
    }

    navigate("/")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="mt-2 w-full">
        {isLoading && <Loader2 className="animate-spin" />}
        Sign In
      </Button>
    </form>
  )
}
