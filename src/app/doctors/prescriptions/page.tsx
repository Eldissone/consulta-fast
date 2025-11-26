'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  name: string
  phone: string
  birthDate: string
}

interface Prescription {
  id: string
  patientId: string
  medication: string
  dosage: string
  instructions: string
  createdAt: string
  patient: Patient
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    instructions: ''
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') {
      router.push('/login')
      return
    }
    fetchPrescriptions()
    fetchPatients()
  }, [user, router])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`/api/doctors/${user?.doctor?.id}/prescriptions`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.doctor?.id) return

    setSaving(true)
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          doctorId: user.doctor.id
        }),
      })

      if (response.ok) {
        alert('Prescrição criada com sucesso!')
        setShowForm(false)
        setFormData({ patientId: '', medication: '', dosage: '', instructions: '' })
        fetchPrescriptions()
      } else {
        alert('Erro ao criar prescrição')
      }
    } catch (error) {
      console.error('Erro ao criar prescrição:', error)
      alert('Erro ao criar prescrição')
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Prescrições Médicas
          </h1>
          <p className="text-gray-600">
            Gerencie as prescrições dos seus pacientes
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : '+ Nova Prescrição'}
          </button>
        </div>

        {/* Formulário de Prescrição */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nova Prescrição</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamento
                  </label>
                  <input
                    type="text"
                    value={formData.medication}
                    onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do medicamento"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosagem
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 500mg 2x ao dia"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruções
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Instruções de uso..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {saving ? 'Salvando...' : 'Salvar Prescrição'}
              </button>
            </form>
          </div>
        )}

        {/* Lista de Prescrições */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Prescrições Recentes</h2>
          </div>
          <div className="p-6">
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma prescrição encontrada.
              </p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {prescription.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {prescription.medication} • {prescription.dosage}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(prescription.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Instruções:</strong> {prescription.instructions}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}