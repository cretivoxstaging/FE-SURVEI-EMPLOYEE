"use client"

import { useEffect, useState } from "react"
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

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const { user, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect kalau sudah login
  useEffect(() => {
    if (user?.isLoggedIn) {
      window.location.replace("/admin/dashboard")
    }
  }, [user])

  const onSubmit = async (data: LoginFormValues) => {
    console.log("🔍 Form submitted with data:", data)
    console.log("🔍 Form validation errors:", form.formState.errors)

    setIsLoading(true)

    try {
      // Simple login check
      const success = login(data.email, data.password)
      console.log("🔍 Login result:", success)

      if (success) {
        toast.success("Login successful")
        console.log("🔍 Redirecting to /admin/dashboard")
        window.location.replace("/admin/dashboard")
      } else {
        toast.error("Invalid email or password")
        console.log("🔍 Login failed")
      }
    } catch (error) {
      console.error("🔍 Login error:", error)
      toast.error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-center font-bold text-3xl mb-2">Hi</CardTitle>
          <CardTitle className="text-center font-bold text-3xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="text-center text-sm text-gray-600 mb-4">
            <p>Use these credentials to login:</p>
            <p><strong>Email:</strong> surveycbn@cbn.com</p>
            <p><strong>Password:</strong> cretivoxogscondfe</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                console.log("🔍 Form submit event triggered")
                e.preventDefault()
                form.handleSubmit(onSubmit)(e)
              }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} disabled={isLoading} />
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
                      <Input type="password" placeholder="Password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
                onClick={() => {
                  console.log("🔍 Button clicked")
                  console.log("🔍 Button disabled:", isLoading)
                  console.log("🔍 Form values:", form.getValues())
                  console.log("🔍 Form valid:", form.formState.isValid)
                }}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
