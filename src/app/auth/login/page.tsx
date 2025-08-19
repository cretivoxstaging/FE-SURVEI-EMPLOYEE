"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DUMMY_EMAIL = "admin@example.com"
const DUMMY_PASSWORD = "admin123"

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const { user, login, isLoading } = useAuth()

  // Redirect ke dashboard kalau sudah login
  useEffect(() => {
    if (!isLoading && user?.isLoggedIn) {
      window.location.replace("/dashboard")
    }
  }, [isLoading, user])

  const onSubmit = (data: LoginFormValues) => {
    if (data.email === DUMMY_EMAIL && data.password === DUMMY_PASSWORD) {
      login(data.email)
      toast.success("Login successful!")
      window.location.replace("/dashboard")
    } else {
      toast.error("Invalid email or password.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-center font-bold text-3xl mb-2">Hi</CardTitle>
          <CardTitle className="text-center font-bold text-3xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full cursor-pointer">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
