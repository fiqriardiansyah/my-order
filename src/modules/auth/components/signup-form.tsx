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
import { signupSchema, type SignupFormValues } from "../schemas/signup.schema"

export function SignupForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
      },
    })
    setIsLoading(false)

    if (error) {
      toast.error("Sign up failed", { description: error.message })
      return
    }

    toast.success("Account created!", {
      description: "Check your email to confirm your account, then sign in.",
    })
    navigate("/auth/signin")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="John Doe"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
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
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-xs">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="mt-2 w-full">
        {isLoading && <Loader2 className="animate-spin" />}
        Create Account
      </Button>
    </form>
  )
}
