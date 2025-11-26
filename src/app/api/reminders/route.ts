import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Buscar consultas agendadas para amanhã
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0))
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999))

    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'SCHEDULED'
      },
      include: {
        patient: {
          select: {
            name: true,
            phone: true
          }
        },
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        }
      }
    })

    // Aqui você integraria com um serviço de SMS/Email
    // Por enquanto, só retornamos os lembretes
    const reminders = appointments.map(apt => ({
      patient: apt.patient.name,
      phone: apt.patient.phone,
      doctor: apt.doctor.name,
      specialty: apt.doctor.specialty,
      scheduledAt: apt.scheduledAt,
      message: `Lembrete: Sua consulta com Dr. ${apt.doctor.name} (${apt.doctor.specialty}) é amanhã às ${new Date(apt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Chegue 15 minutos antes.`
    }))

    return NextResponse.json({
      message: `${reminders.length} lembretes para enviar`,
      reminders
    })
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}