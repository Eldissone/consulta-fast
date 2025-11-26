// check-prescription-model.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkModel() {
  try {
    console.log('🔍 Verificando modelo Prescription...')
    
    // Tentar acessar o modelo
    const prescriptions = await prisma.prescription.findMany()
    console.log('✅ Modelo Prescription está acessível')
    console.log(`📊 Total de prescrições: ${prescriptions.length}`)
    
    // Verificar se as relações estão funcionando
    const doctors = await prisma.doctor.findMany({
      include: {
        prescriptions: true
      }
    })
    
    console.log('✅ Relação Doctor -> Prescriptions está funcionando')
    
    const patients = await prisma.patient.findMany({
      include: {
        prescriptions: true
      }
    })
    
    console.log('✅ Relação Patient -> Prescriptions está funcionando')
    
  } catch (error: any) {
    console.error('❌ Erro ao acessar modelo Prescription:', error.message)
    
    // Verificar quais modelos estão disponíveis
    console.log('🔍 Modelos disponíveis no Prisma Client:')
    const models = Object.keys(prisma)
    console.log(models.filter(model => !model.startsWith('_')))
    
  } finally {
    await prisma.$disconnect()
  }
}

checkModel()