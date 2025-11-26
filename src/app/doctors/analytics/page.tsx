'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Analytics {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  monthlyStats: { month: string; count: number }[]
  popularHours: { hour: string; count: number }[]
  patientAgeDistribution: { range: string; count: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') {
      router.push('/login')
      return
    }
    fetchAnalytics()
  }, [user, router])

  const fetchAnalytics = async () => {
    try {
      // Simular dados de analytics
      const mockAnalytics: Analytics = {
        totalAppointments: 156,
        completedAppointments: 128,
        cancelledAppointments: 12,
        monthlyStats: [
          { month: 'Jan', count: 23 },
          { month: 'Fev', count: 28 },
          { month: 'Mar', count: 32 },
          { month: 'Abr', count: 29 },
          { month: 'Mai', count: 35 },
          { month: 'Jun', count: 31 }
        ],
        popularHours: [
          { hour: '08:00', count: 45 },
          { hour: '09:00', count: 38 },
          { hour: '10:00', count: 42 },
          { hour: '14:00', count: 35 },
          { hour: '15:00', count: 28 },
          { hour: '16:00', count: 22 }
        ],
        patientAgeDistribution: [
          { range: '0-18', count: 15 },
          { range: '19-35', count: 42 },
          { range: '36-50', count: 38 },
          { range: '51-65', count: 28 },
          { range: '65+', count: 12 }
        ]
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando estatísticas...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Erro ao carregar estatísticas</div>
      </div>
    )
  }

  const completionRate = ((analytics.completedAppointments / analytics.totalAppointments) * 100).toFixed(1)
  const cancellationRate = ((analytics.cancelledAppointments / analytics.totalAppointments) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Estatísticas e Relatórios
          </h1>
          <p className="text-gray-600">
            Análise do seu desempenho e dados da clínica
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {analytics.totalAppointments}
            </div>
            <div className="text-gray-600">Total de Consultas</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {analytics.completedAppointments}
            </div>
            <div className="text-gray-600">Consultas Realizadas</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {analytics.cancelledAppointments}
            </div>
            <div className="text-gray-600">Cancelamentos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {completionRate}%
            </div>
            <div className="text-gray-600">Taxa de Conclusão</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estatísticas Mensais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Consultas por Mês</h3>
            <div className="space-y-2">
              {analytics.monthlyStats.map(stat => (
                <div key={stat.month} className="flex items-center justify-between">
                  <span className="text-gray-700">{stat.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(stat.count / 40) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horários Populares */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">⏰ Horários Mais Procurados</h3>
            <div className="space-y-2">
              {analytics.popularHours.map(hour => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-gray-700">{hour.hour}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(hour.count / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{hour.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Idade */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">👥 Distribuição por Idade</h3>
            <div className="space-y-2">
              {analytics.patientAgeDistribution.map(age => (
                <div key={age.range} className="flex items-center justify-between">
                  <span className="text-gray-700">{age.range} anos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(age.count / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{age.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">📋 Taxas de Atendimento</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Taxa de Conclusão</span>
                  <span className="text-green-600 font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Taxa de Cancelamento</span>
                  <span className="text-red-600 font-semibold">{cancellationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${cancellationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}