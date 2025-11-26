// check-medical-records.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMedicalRecords() {
  try {
    console.log('🔍 Verificando modelo MedicalRecord...')
    
    // Tentar acessar o modelo
    const records = await prisma.medicalRecord.findMany()
    console.log('✅ Modelo MedicalRecord está acessível')
    console.log(`📊 Total de registros médicos: ${records.length}`)
    
    // Verificar se as relações estão funcionando
    const patients = await prisma.patient.findMany({
      include: {
        medicalRecords: true
      }
    })
    
    console.log('✅ Relação Patient -> MedicalRecords está funcionando')
    
    const doctors = await prisma.doctor.findMany({
      include: {
        medicalRecords: true
      }
    })
    
    console.log('✅ Relação Doctor -> MedicalRecords está funcionando')
    
  } catch (error: any) {
    console.error('❌ Erro ao acessar modelo MedicalRecord:', error.message)
    
    // Verificar quais modelos estão disponíveis
    console.log('🔍 Modelos disponíveis no Prisma Client:')
    const models = Object.keys(prisma)
    console.log(models.filter(model => !model.startsWith('_')))
    
  } finally {
    await prisma.$disconnect()
  }
}

checkMedicalRecords()