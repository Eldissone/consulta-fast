'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { user, logout, unreadCount = 0 } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const userName =
    user?.patient?.name ||
    user?.doctor?.name ||
    'Usuário'

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">MedApp</h1>
            <span className="ml-2 text-sm text-gray-600">
              Menos gritos, mais saúde
            </span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-5">
            {user ? (
              <>

                {user.role === 'PATIENT' && (
                  <>
                    <Link href="/doctors" className="link-nav">Médicos</Link>
                    <Link href="/my-appointments" className="link-nav">Minhas Consultas</Link>
                    <Link href="/my-exams" className="link-nav">Meus Exames</Link>
                    <Link
                      href="/messages"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      💬 Mensagens
                    </Link>

                    <Link href="/notifications" className="relative link-nav">
                      🔔 Notificações
                      {unreadCount > 0 && (
                        <span className="badge">{unreadCount}</span>
                      )}
                    </Link>
                  </>
                )}

                {user.role === 'DOCTOR' && (
                  <>
                    <Link href="/doctors/dashboard" className="link-nav">Dashboard</Link>
                    <Link href="/doctors/schedule" className="link-nav">Minha Agenda</Link>
                    <Link href="/doctors/prescriptions" className="link-nav">Prescrições</Link>
                    <Link
                      href="/doctors/analytics"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      📊 Estatísticas
                    </Link>
                    <Link
                      href="/messages"
                      className="text-gray-700 hover:text-blue-600"
                    >
                      💬 Mensagens
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="btn-danger"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="link-nav">Entrar</Link>
                <Link href="/register" className="btn-primary">Cadastrar</Link>
              </>
            )}
          </nav>

          {/* Botão Mobile */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {/* Menu Mobile */}
        {open && (
          <div className="md:hidden flex flex-col space-y-3 pb-4 pt-2">
            {user ? (
              <>


                {user.role === 'PATIENT' && (
                  <>
                    <Link href="/doctors" className="link-mobile">Médicos</Link>
                    <Link href="/my-appointments" className="link-mobile">Minhas Consultas</Link>
                    <Link href="/my-exams" className="link-mobile">Meus Exames</Link>
                    <Link href="/notifications" className="relative link-mobile">
                      🔔 Notificações
                      {unreadCount > 0 && (
                        <span className="badge">{unreadCount}</span>
                      )}
                    </Link>
                  </>
                )}

                {user.role === 'DOCTOR' && (
                  <>
                    <Link href="/doctors/dashboard" className="link-mobile">Dashboard</Link>
                    <Link href="/doctors/schedule" className="link-mobile">Minha Agenda</Link>
                    <Link href="/doctors/prescriptions" className="link-mobile">Prescrições</Link>
                  </>
                )}

                <button onClick={handleLogout} className="btn-danger w-full mt-2">
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="link-mobile">Entrar</Link>
                <Link href="/register" className="btn-primary w-full text-center">Cadastrar</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

