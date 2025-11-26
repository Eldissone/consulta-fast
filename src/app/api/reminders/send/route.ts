import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
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

    const results = []

    for (const appointment of appointments) {
      // Aqui você integraria com um serviço de SMS/Email
      // Por enquanto, só registramos no console
      const message = `Lembrete: Consulta com Dr. ${appointment.doctor.name} (${appointment.doctor.specialty}) amanhã às ${new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      
      console.log(`📱 SMS para ${appointment.patient.phone}: ${message}`)
      
      results.push({
        patient: appointment.patient.name,
        phone: appointment.patient.phone,
        message: message
      })
    }

    return NextResponse.json({
      message: `${results.length} lembretes processados`,
      results
    })

  } catch (error) {
    console.error('Erro ao enviar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}