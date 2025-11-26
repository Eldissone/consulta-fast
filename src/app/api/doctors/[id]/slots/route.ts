import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function generateTimeSlots(startTime: string, endTime: string, slotDuration: number = 30) {
  const slots: string[] = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMinute = startMinute
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    currentMinute += slotDuration
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60)
      currentMinute = currentMinute % 60
    }
  }
  
  return slots
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar agenda do médico
    const appointmentDate = new Date(date)
    const dayOfWeek = appointmentDate.getDay() // 0-6 (Domingo-Sábado)

    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId,
        dayOfWeek
      }
    })

    if (schedules.length === 0) {
      return NextResponse.json([])
    }

    // Buscar agendamentos existentes
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`)
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      select: {
        scheduledAt: true
      }
    })

    const bookedTimes = appointments.map(apt => 
      apt.scheduledAt.toTimeString().slice(0, 5)
    )

    // Gerar todos os slots disponíveis
    const allSlots: { time: string; available: boolean }[] = []
    
    schedules.forEach(schedule => {
      const slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration)
      
      slots.forEach(time => {
        const isAvailable = !bookedTimes.includes(time)
        allSlots.push({
          time,
          available: isAvailable
        })
      })
    })

    // Ordenar os slots por horário
    allSlots.sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json(allSlots)
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}