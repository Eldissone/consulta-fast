'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appointment {
    id: string
    scheduledAt: string
    status: string
    patient: {
        name: string
        phone: string
        birthDate: string
    }
}

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const { user, login } = useAuth()
    const router = useRouter()

    useEffect(() => {
        console.log('🔍 useEffect - user:', user) // DEBUG

        // Verificar se há usuário no localStorage (fallback)
        const savedUser = localStorage.getItem('user')
        if (savedUser && !user) {
            console.log('🔍 Usuário encontrado no localStorage') // DEBUG
            login(JSON.parse(savedUser))
            return
        }

        if (!user) {
            console.log('🔍 Nenhum usuário, redirecionando para login') // DEBUG
            router.push('/login')
            return
        }

        if (user.role !== 'DOCTOR') {
            console.log('🔍 Usuário não é médico, redirecionando') // DEBUG
            router.push('/doctors')
            return
        }

        console.log('🔍 Usuário é médico, buscando consultas...') // DEBUG
        fetchAppointments()
    }, [user, router, login])

    const fetchAppointments = async () => {
        try {
            if (!user?.doctor?.id) {
                console.log('🔍 ID do médico não encontrado') // DEBUG
                return
            }

            console.log('🔍 Buscando consultas para médico:', user.doctor.id) // DEBUG

            const response = await fetch(`/api/doctors/${user.doctor.id}/appointments`)
            console.log('🔍 Resposta da API:', response.status) // DEBUG

            if (response.ok) {
                const data = await response.json()
                console.log('🔍 Consultas recebidas:', data.length) // DEBUG
                setAppointments(data)

                // Filtrar consultas de hoje
                const today = new Date().toDateString()
                const todayApps = data.filter((apt: Appointment) =>
                    new Date(apt.scheduledAt).toDateString() === today
                )
                console.log('🔍 Consultas de hoje:', todayApps.length) // DEBUG
                setTodayAppointments(todayApps)
            } else {
                console.error('🔍 Erro na resposta da API') // DEBUG
            }
        } catch (error) {
            console.error('🔍 Erro ao buscar consultas:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateAppointmentStatus = async (appointmentId: string, status: string) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            })

            if (response.ok) {
                alert('Status atualizado com sucesso!')
                fetchAppointments()
            } else {
                alert('Erro ao atualizar status')
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            alert('Erro ao atualizar status')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const calculateAge = (birthDate: string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }

        return age
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Carregando dashboard médico...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {
                    // No cabeçalho do dashboard, adicione:
                    <div className="flex space-x-4">
                        <Link
                            href="/doctors/schedule"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Minha Agenda
                        </Link>
                        <Link
                            href="/doctors/prescriptions"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Prescrições
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Sair
                        </button>
                    </div>
                }
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Dashboard Médico
                            </h1>
                            <p className="text-gray-600">
                                Olá, <strong>Dr. {user?.doctor?.name}</strong>! Bem-vindo ao seu painel.
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/doctors/schedule"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Minha Agenda
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            {todayAppointments.length}
                        </div>
                        <div className="text-gray-600">Consultas Hoje</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                            {appointments.filter(a => a.status === 'CONFIRMED').length}
                        </div>
                        <div className="text-gray-600">Confirmadas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                            {appointments.filter(a => a.status === 'SCHEDULED').length}
                        </div>
                        <div className="text-gray-600">Agendadas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-2xl font-bold text-red-600 mb-2">
                            {appointments.filter(a => a.status === 'CANCELLED').length}
                        </div>
                        <div className="text-gray-600">Canceladas</div>
                    </div>
                </div>

                {/* Consultas de Hoje */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Consultas de Hoje */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                📅 Consultas de Hoje
                            </h2>
                        </div>
                        <div className="p-6">
                            {todayAppointments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Nenhuma consulta agendada para hoje.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {todayAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {appointment.patient.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {calculateAge(appointment.patient.birthDate)} anos • {appointment.patient.phone}
                                                    </p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                                                >
                                                    ✅ Realizada
                                                </button>
                                                <button
                                                    onClick={() => updateAppointmentStatus(appointment.id, 'NO_SHOW')}
                                                    className="flex-1 bg-orange-600 text-white py-2 px-3 rounded text-sm hover:bg-orange-700"
                                                >
                                                    ❌ Não Compareceu
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Próximas Consultas */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                ⏰ Próximas Consultas
                            </h2>
                        </div>
                        <div className="p-6">
                            {appointments
                                .filter(apt => new Date(apt.scheduledAt) > new Date() && apt.status === 'SCHEDULED')
                                .slice(0, 5)
                                .length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Nenhuma próxima consulta.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments
                                        .filter(apt => new Date(apt.scheduledAt) > new Date() && apt.status === 'SCHEDULED')
                                        .slice(0, 5)
                                        .map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {appointment.patient.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(appointment.scheduledAt)}
                                                    </div>
                                                </div>
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    Agendada
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}