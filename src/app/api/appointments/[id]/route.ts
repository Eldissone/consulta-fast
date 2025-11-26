import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const { status } = await request.json()

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar o status da consulta
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        doctor: {
          select: { name: true, specialty: true }
        },
        patient: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}