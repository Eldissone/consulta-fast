// src/app/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">MedApp</h1>
              <span className="ml-2 text-sm text-gray-600">
                Menos gritos, mais saúde
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Cadastrar
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Marque sua consulta 
            <span className="text-blue-600 block">sem sair de casa</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Como aquele caderno da recepção do hospital, só que com Wi-Fi 
            e menos gritos. Agenda sua consulta em poucos cliques.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link 
              href="/register"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Começar Agora
            </Link>
            <Link 
              href="/doctors"
              className="inline-block border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Ver Médicos
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Agendamento Rápido</h3>
            <p className="text-gray-600">
              Escolha o médico, dia e horário. Simples como marcar hora no barbeiro.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2">Lembretes Inteligentes</h3>
            <p className="text-gray-600">
              Receba notificações para não esquecer da consulta. Sem Alzheimer digital.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Sem Filas</h3>
            <p className="text-gray-600">
              Chega de ligar perguntando "tem vaga hoje?". Tudo na palma da mão.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}