import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            email: true
          }
        },
        schedules: true
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Erro ao buscar médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}