'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

interface TimeSlot {
  time: string
  available: boolean
}

interface Doctor {
  id: string
  name: string
  specialty: string
  phone: string
  schedules: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}

export default function NewAppointmentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const doctorId = searchParams.get('doctorId')
  
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Dias da semana em português
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!doctorId) {
      setError('Médico não especificado')
      return
    }

    fetchDoctor()
  }, [user, router, doctorId])

  useEffect(() => {
    if (selectedDate && doctorId) {
      fetchTimeSlots()
    } else {
      setTimeSlots([])
      setSelectedTime('')
    }
  }, [selectedDate, doctorId])

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`)
      if (!response.ok) {
        throw new Error('Médico não encontrado')
      }
      const data = await response.json()
      setDoctor(data)
    } catch (error) {
      setError('Erro ao carregar informações do médico')
      console.error('Erro ao carregar médico:', error)
    }
  }

  const fetchTimeSlots = async () => {
    setLoading(true)
    setSelectedTime('')
    try {
      const response = await fetch(`/api/doctors/${doctorId}/slots?date=${selectedDate}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar horários')
      }
      const slots = await response.json()
      setTimeSlots(slots)
    } catch (error) {
      setError('Erro ao carregar horários disponíveis')
      console.error('Erro ao carregar horários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setSelectedTime('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !doctorId || !user?.patient) {
      setError('Por favor, selecione data e horário')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`)
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          patientId: user.patient.id,
          scheduledAt: scheduledAt.toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Consulta agendada com sucesso!')
        router.push('/my-appointments')
      } else {
        setError(data.error || 'Erro ao agendar consulta')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
      console.error('Erro ao agendar:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Calcular datas disponíveis (próximos 30 dias)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      
      // Verificar se é um dia que o médico atende
      const dayOfWeek = date.getDay()
      const hasSchedule = doctor?.schedules?.some(schedule => schedule.dayOfWeek === dayOfWeek)
      
      if (hasSchedule) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  }

  const availableDates = getAvailableDates()
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null
  const dayName = selectedDateObj ? daysOfWeek[selectedDateObj.getDay()] : ''

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Carregando informações do médico...</div>
          <Link href="/doctors" className="text-blue-600 hover:text-blue-700">
            ← Voltar para médicos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link 
            href="/doctors" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Voltar para lista de médicos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Agendar Consulta</h1>
          <div className="mt-4 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dr. {doctor.name}</h2>
                <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                <p className="text-gray-600 text-sm">{doctor.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Agendamento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📅 Escolha a Data da Consulta
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {availableDates.map(date => {
                  const dateObj = new Date(date)
                  const isSelected = selectedDate === date
                  const dayNumber = dateObj.getDate()
                  const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' })
                  const dayNameShort = daysOfWeek[dateObj.getDay()].slice(0, 3)
                  
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{dayNumber}</div>
                      <div className="text-xs opacity-75">{month}</div>
                      <div className="text-xs opacity-75">{dayNameShort}</div>
                    </button>
                  )
                })}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={availableDates[0]}
                max={availableDates[availableDates.length - 1]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Seleção de Horário */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ⏰ Horários Disponíveis {dayName && `- ${dayName}`}
                </label>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Carregando horários disponíveis...</div>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : slot.available
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      Não há horários disponíveis para esta data.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Tente selecionar outra data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Resumo do Agendamento */}
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Resumo do Agendamento</h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><strong>Médico:</strong> Dr. {doctor.name}</p>
                  <p><strong>Especialidade:</strong> {doctor.specialty}</p>
                  <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')} ({dayName})</p>
                  <p><strong>Horário:</strong> {selectedTime}</p>
                </div>
              </div>
            )}

            {/* Botão de Confirmação */}
            <button
              type="submit"
              disabled={!selectedTime || submitting || loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Agendando...
                </span>
              ) : (
                '✅ Confirmar Agendamento'
              )}
            </button>
          </form>

          {/* Informações Úteis */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">💡 Informações Importantes</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Chegue 15 minutos antes do horário agendado</li>
              <li>• Traga documento de identificação</li>
              <li>• Cancelamentos devem ser feitos com 24h de antecedência</li>
              <li>• Você receberá um lembrete no dia anterior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}