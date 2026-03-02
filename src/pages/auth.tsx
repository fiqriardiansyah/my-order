import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SigninForm } from "@/modules/auth/components/signin-form";
import { SignupForm } from "@/modules/auth/components/signup-form";
import { useAuth } from "@/modules/auth/context";

const TAB_PATHS = {
  "/auth/signin": "signin",
  "/auth/signup": "signup",
} as const;

export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const activeTab = TAB_PATHS[pathname as keyof typeof TAB_PATHS] ?? "signin";

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">My Order</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Restaurant management made simple
          </p>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                navigate(val === "signup" ? "/auth/signup" : "/auth/signin")
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <SigninForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
