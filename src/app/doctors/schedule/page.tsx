'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Schedule {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
  maxPatients: number
}

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const daysOfWeek = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ]

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') {
      router.push('/login')
      return
    }
    fetchSchedules()
  }, [user, router])

  const fetchSchedules = async () => {
    try {
      if (!user?.doctor?.id) return

      const response = await fetch(`/api/doctors/${user.doctor.id}/schedules`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error('Erro ao buscar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSchedule = (index: number, field: string, value: any) => {
    const updatedSchedules = [...schedules]
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value
    }
    setSchedules(updatedSchedules)
  }

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '17:00',
        slotDuration: 30,
        maxPatients: 1
      }
    ])
  }

  const removeSchedule = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index)
    setSchedules(updatedSchedules)
  }

  const saveSchedules = async () => {
    if (!user?.doctor?.id) return

    setSaving(true)
    try {
      const response = await fetch(`/api/doctors/${user.doctor.id}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules }),
      })

      if (response.ok) {
        alert('Agenda salva com sucesso!')
        fetchSchedules()
      } else {
        alert('Erro ao salvar agenda')
      }
    } catch (error) {
      console.error('Erro ao salvar agenda:', error)
      alert('Erro ao salvar agenda')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Minha Agenda
          </h1>
          <p className="text-gray-600">
            Configure seus horários de atendimento
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <button
              onClick={addSchedule}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Adicionar Horário
            </button>
          </div>

          <div className="space-y-6">
            {schedules.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia da Semana
                    </label>
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) => updateSchedule(index, 'dayOfWeek', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {daysOfWeek.map((day, dayIndex) => (
                        <option key={dayIndex} value={dayIndex}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário Início
                    </label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário Fim
                    </label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração (min)
                    </label>
                    <input
                      type="number"
                      value={schedule.slotDuration}
                      onChange={(e) => updateSchedule(index, 'slotDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="15"
                      max="60"
                      step="15"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => removeSchedule(index)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveSchedules}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Salvando...' : 'Salvar Agenda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}