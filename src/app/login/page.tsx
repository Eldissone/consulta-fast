'use client'

import { useState, useEffect } from 'react' // 🔥 Adicione useEffect
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true) // 🔥 Novo estado
  const router = useRouter()

  // 🔥 VERIFICAR SE JÁ ESTÁ LOGADO
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          console.log('🔍 Usuário já logado, redirecionando...', user)
          
          // Redirecionar baseado no tipo de usuário
          if (user.role === 'PATIENT') {
            router.push('/doctors')
          } else if (user.role === 'DOCTOR') {
            router.push('/doctor/dashboard') // 🔥 Corrigi o caminho
          } else {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        // Se der erro, limpa o localStorage e permite login
        localStorage.removeItem('user')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login bem-sucedido
        localStorage.setItem('user', JSON.stringify(data.user))
        alert('Login realizado com sucesso!')
        
        // Redirecionar baseado no tipo de usuário
        if (data.user.role === 'PATIENT') {
          router.push('/doctors')
        } else if (data.user.role === 'DOCTOR') {
          router.push('/doctor/dashboard') // 🔥 Corrigi o caminho
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Erro ao fazer login')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 MOSTRAR LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Verificando autenticação...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Entrar no MedApp</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sua senha"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Não tem conta?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Cadastre-se
            </Link>
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            ← Voltar para a página inicial
          </Link>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Credenciais para teste:</h3>
          <p className="text-sm text-blue-700">
            <strong>Paciente:</strong> paciente@exemplo.com / senha123
          </p>
          <p className="text-sm text-blue-700">
            <strong>Médico:</strong> dr.silva@clinica.com / senha123
          </p>
        </div>
      </div>
    </div>
  )
} 