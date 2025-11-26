// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, scheduledAt } = await request.json()

    // Verificar se o horário está disponível
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: new Date(scheduledAt),
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Horário já ocupado' },
        { status: 400 }
      )
    }

    // Verificar se está dentro do horário de trabalho do médico
    const appointmentDate = new Date(scheduledAt)
    const dayOfWeek = appointmentDate.getDay()
    const timeString = appointmentDate.toTimeString().slice(0, 5)

    const doctorSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        startTime: { lte: timeString },
        endTime: { gte: timeString }
      }
    })

    if (!doctorSchedule) {
      return NextResponse.json(
        { error: 'Médico não atende neste horário' },
        { status: 400 }
      )
    }

    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: appointmentDate,
        status: 'SCHEDULED'
      },
      include: {
        doctor: {
          select: { name: true, specialty: true }
        },
        patient: {
          select: { name: true }
        }
      }
    })

    // TODO: Enviar notificação/email de confirmação

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const date = searchParams.get('date')

    let where: any = {}

    if (doctorId) where.doctorId = doctorId
    if (patientId) where.patientId = patientId
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      
      where.scheduledAt = {
        gte: startDate,
        lt: endDate
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: { name: true, specialty: true }
        },
        patient: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}