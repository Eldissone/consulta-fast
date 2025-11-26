// update-passwords.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updatePasswords() {
  console.log('🔐 Atualizando senhas para bcrypt...')
  
  try {
    // Atualizar senha do paciente
    const patientUser = await prisma.user.findFirst({
      where: { email: 'paciente@exemplo.com' }
    })
    
    if (patientUser) {
      const hashedPassword = await bcrypt.hash('senha123', 12)
      await prisma.user.update({
        where: { id: patientUser.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Senha do paciente atualizada')
    }

    // Atualizar senha do médico
    const doctorUser = await prisma.user.findFirst({
      where: { email: 'dr.silva@clinica.com' }
    })
    
    if (doctorUser) {
      const hashedPassword = await bcrypt.hash('senha123', 12)
      await prisma.user.update({
        where: { id: doctorUser.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Senha do médico atualizada')
    }

    // Atualizar outros médicos
    const otherDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        email: {
          contains: '@clinica.com'
        }
      }
    })

    for (const doctor of otherDoctors) {
      const hashedPassword = await bcrypt.hash('senha123', 12)
      await prisma.user.update({
        where: { id: doctor.id },
        data: { password: hashedPassword }
      })
      console.log(`✅ Senha do médico ${doctor.email} atualizada`)
    }

    console.log('🎉 Todas as senhas foram atualizadas para bcrypt!')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePasswords()