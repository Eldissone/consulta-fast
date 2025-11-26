'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Doctor {
    id: string
    name: string
    specialty: string
    phone: string
    user: {
        email: string
    }
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSpecialty, setSelectedSpecialty] = useState('')
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirecionar se não estiver logado
        if (!user) {
            router.push('/login')
            return
        }
        fetchDoctors()
    }, [user, router])

    const fetchDoctors = async () => {
        try {
            const response = await fetch('/api/doctors')
            const data = await response.json()
            setDoctors(data)
        } catch (error) {
            console.error('Erro ao carregar médicos:', error)
        } finally {
            setLoading(false)
        }
    }

    const specialties = [...new Set(doctors.map(doctor => doctor.specialty))]
    const filteredDoctors = selectedSpecialty
        ? doctors.filter(doctor => doctor.specialty === selectedSpecialty)
        : doctors

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Nossa Equipe Médica
                            </h1>
                            <p className="text-gray-600">
                                Olá, {user?.patient?.name || user?.doctor?.name}! Escolha seu médico.
                            </p>
                        </div>
                        <Link
                            href="/my-appointments"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Minhas Consultas
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-6 flex gap-4">
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas as especialidades</option>
                        {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>
                                {specialty}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de Médicos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">👨‍⚕️</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {doctor.name}
                                </h3>
                                <p className="text-blue-600 font-medium mb-3">
                                    {doctor.specialty}
                                </p>
                                <p className="text-gray-600 text-sm mb-4">
                                    {doctor.phone}
                                </p>
                                <Link
                                    href={`/appointment/new?doctorId=${doctor.id}`}
                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Agendar Consulta
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDoctors.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            Nenhum médico encontrado para a especialidade selecionada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}