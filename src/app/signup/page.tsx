"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start your learning roadmap.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
              {state?.errors?.name && (
                <p className="text-sm text-destructive">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
              {state?.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && (
                <ul className="text-sm text-destructive">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <Button disabled={pending} type="submit" className="w-full">
              {pending ? "Creating account…" : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
