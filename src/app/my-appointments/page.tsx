'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appointment {
  id: string
  scheduledAt: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  doctor: {
    name: string
    specialty: string
    phone: string
  }
  patient: {
    name: string
    phone: string
  }
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchAppointments()
  }, [user, router])

  const fetchAppointments = async () => {
    try {
      if (!user?.patient?.id) return

      const response = await fetch(`/api/appointments/my-appointments?patientId=${user.patient.id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return
    }

    setCancellingId(appointmentId)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      })

      if (response.ok) {
        alert('Consulta cancelada com sucesso!')
        fetchAppointments() // Recarregar a lista
      } else {
        alert('Erro ao cancelar consulta')
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      alert('Erro ao cancelar consulta')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendada'
      case 'CONFIRMED':
        return 'Confirmada'
      case 'COMPLETED':
        return 'Realizada'
      case 'CANCELLED':
        return 'Cancelada'
      case 'NO_SHOW':
        return 'Não Compareceu'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcomingAppointment = (scheduledAt: string) => {
    const appointmentDate = new Date(scheduledAt)
    const now = new Date()
    return appointmentDate > now
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando suas consultas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Minhas Consultas
              </h1>
              <p className="text-gray-600">
                Olá, <strong>{user?.patient?.name}</strong>! Aqui estão suas consultas agendadas.
              </p>
            </div>
            <Link
              href="/doctors"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar Nova Consulta
            </Link>
          </div>
        </div>

        {/* Lista de Consultas */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Nenhuma consulta agendada
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Você ainda não possui consultas agendadas. Que tal marcar sua primeira consulta?
            </p>
            <Link
              href="/doctors"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Agendar Primeira Consulta
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Consultas Futuras */}
            {appointments.filter(apt => isUpcomingAppointment(apt.scheduledAt) && apt.status !== 'CANCELLED').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📋 Próximas Consultas
                </h2>
                <div className="space-y-4">
                  {appointments
                    .filter(apt => isUpcomingAppointment(apt.scheduledAt) && apt.status !== 'CANCELLED')
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍⚕️</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Dr. {appointment.doctor.name}
                                </h3>
                                <p className="text-blue-600">{appointment.doctor.specialty}</p>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>📅 Data e Horário:</strong>
                                <br />
                                {formatDate(appointment.scheduledAt)}
                              </div>
                              <div>
                                <strong>📞 Contato:</strong>
                                <br />
                                {appointment.doctor.phone}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                            
                            {appointment.status !== 'CANCELLED' && isUpcomingAppointment(appointment.scheduledAt) && (
                              <button
                                onClick={() => cancelAppointment(appointment.id)}
                                disabled={cancellingId === appointment.id}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
                              >
                                {cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Histórico */}
            {appointments.filter(apt => !isUpcomingAppointment(apt.scheduledAt) || apt.status === 'CANCELLED').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📜 Histórico de Consultas
                </h2>
                <div className="space-y-4">
                  {appointments
                    .filter(apt => !isUpcomingAppointment(apt.scheduledAt) || apt.status === 'CANCELLED')
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">👨‍⚕️</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Dr. {appointment.doctor.name}
                                </h3>
                                <p className="text-blue-600">{appointment.doctor.specialty}</p>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>📅 Data e Horário:</strong>
                                <br />
                                {formatDate(appointment.scheduledAt)}
                              </div>
                              <div>
                                <strong>📞 Contato:</strong>
                                <br />
                                {appointment.doctor.phone}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações Úteis */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Informações Importantes</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Chegue 15 minutos antes</strong> do horário agendado</li>
            <li>• Traga seu <strong>documento de identificação</strong> e <strong>cartão do plano</strong> (se tiver)</li>
            <li>• Cancelamentos devem ser feitos com <strong>antecedência mínima de 24 horas</strong></li>
            <li>• Em caso de urgência, entre em contato diretamente com a clínica</li>
          </ul>
        </div>
      </div>
    </div>
  )
}