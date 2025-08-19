"use client"

import { useState, useEffect } from "react"

interface User {
  email: string
  isLoggedIn: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cek localStorage hanya di client
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adminAuth")
      if (stored) {
        setUser(JSON.parse(stored))
      }
      setIsLoading(false)
    }
  }, [])

  const login = (email: string) => {
    const newUser = { email, isLoggedIn: true }
    localStorage.setItem("adminAuth", JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem("adminAuth")
    setUser(null)
  }

  return { user, login, logout, isLoading }
}
