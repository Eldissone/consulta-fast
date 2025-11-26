// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco PostgreSQL...')

  try {
    // Limpar tabelas existentes (em ordem correta por causa das FKs)
    await prisma.appointment.deleteMany()
    await prisma.doctorSchedule.deleteMany()
    await prisma.doctor.deleteMany()
    await prisma.patient.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Tabelas limpas')

    // Criar médico principal - AGORA GUARDAMOS O ID CORRETAMENTE
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.silva@clinica.com',
        password: 'senha123',
        role: 'DOCTOR',
        doctor: {
          create: {
            name: 'Dr. Carlos Silva',
            specialty: 'Cardiologia',
            phone: '(11) 9999-8888',
            licenseNumber: 'CRM-SP 123456'
          }
        }
      },
      include: {
        doctor: true // Isso inclui o doctor criado
      }
    })

    const doctorId = doctorUser.doctor!.id
    console.log('✅ Médico principal criado ID:', doctorId)

    // Criar agenda do médico - USANDO O ID CORRETO
    await prisma.doctorSchedule.createMany({
      data: [
        {
          doctorId: doctorId,
          dayOfWeek: 1, // Segunda
          startTime: '08:00',
          endTime: '12:00',
          slotDuration: 30,
          maxPatients: 8
        },
        {
          doctorId: doctorId,
          dayOfWeek: 1,
          startTime: '14:00',
          endTime: '18:00', 
          slotDuration: 30,
          maxPatients: 8
        },
        {
          doctorId: doctorId,
          dayOfWeek: 2, // Terça
          startTime: '08:00',
          endTime: '12:00',
          slotDuration: 30,
          maxPatients: 8
        }
      ]
    })

    console.log('✅ Agenda do médico criada')

    // Criar paciente de exemplo
    const patientUser = await prisma.user.create({
      data: {
        email: 'paciente@exemplo.com',
        password: 'senha123',
        role: 'PATIENT',
        patient: {
          create: {
            name: 'João da Silva',
            phone: '(11) 8888-7777',
            birthDate: new Date('1990-01-01')
          }
        }
      }
    })

    console.log('✅ Paciente criado')

    // Criar mais médicos
    const specialties = [
      'Pediatria',
      'Clínica Geral', 
      'Ginecologia',
      'Dermatologia',
      'Ortopedia'
    ]

    for (const specialty of specialties) {
      const email = `dr.${specialty.toLowerCase().replace(' ', '')}@clinica.com`
      
      await prisma.user.create({
        data: {
          email: email,
          password: 'senha123',
          role: 'DOCTOR',
          doctor: {
            create: {
              name: `Dr. ${specialty}`,
              specialty,
              phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
              licenseNumber: `CRM-SP ${Math.floor(100000 + Math.random() * 900000)}`
            }
          }
        }
      })
    }

    console.log('✅ Todos os médicos especialistas criados')

    console.log('🎉 Seed completado com sucesso!')
    console.log('')
    console.log('📋 Credenciais para teste:')
    console.log('👨‍⚕️ Médico: dr.silva@clinica.com / senha123')
    console.log('👤 Paciente: paciente@exemplo.com / senha123')

  } catch (error) {
    console.error('❌ Erro detalhado no seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })