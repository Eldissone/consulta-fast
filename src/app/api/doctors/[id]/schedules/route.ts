import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id

    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Erro ao buscar agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id
    const { schedules } = await request.json()

    // Limpar agenda existente
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId }
    })

    // Criar nova agenda
    const createdSchedules = await prisma.doctorSchedule.createMany({
      data: schedules.map((schedule: any) => ({
        ...schedule,
        doctorId
      }))
    })

    return NextResponse.json(createdSchedules)
  } catch (error) {
    console.error('Erro ao salvar agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}