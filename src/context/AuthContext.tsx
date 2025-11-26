'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  patient?: {
    id: string
    name: string
    phone: string
    birthDate: string
  }
  doctor?: {
    id: string
    name: string
    specialty: string
    phone: string
  }
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  loading: boolean
  unreadCount: number
  setUnreadCount: (value: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Recuperar user
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    // Recuperar notificações não lidas
    const savedUnread = localStorage.getItem('unreadCount')
    if (savedUnread) {
      setUnreadCount(Number(savedUnread))
    }

    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('unreadCount')
    setUnreadCount(0)
  }

  // Salvar mudanças no unreadCount
  useEffect(() => {
    localStorage.setItem('unreadCount', unreadCount.toString())
  }, [unreadCount])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        unreadCount,
        setUnreadCount
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
