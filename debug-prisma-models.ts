// debug-prisma-models.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugModels() {
  console.log('🔍 Debugando modelos disponíveis no Prisma Client...')
  
  const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
  
  console.log('📋 Modelos disponíveis:')
  models.forEach(model => {
    console.log(`   - ${model}`)
    
    // Verificar métodos disponíveis
    const modelMethods = Object.keys((prisma as any)[model]).filter(method => 
      !method.startsWith('$') && !method.startsWith('_')
    )
    
    if (modelMethods.length > 0) {
      console.log(`     Métodos: ${modelMethods.join(', ')}`)
    }
  })
  
  // Verificar específico do medicalRecord
  if ('medicalRecord' in prisma) {
    console.log('\n✅ medicalRecord está disponível!')
    const medicalRecordMethods = Object.keys((prisma as any).medicalRecord)
    console.log(`Métodos: ${medicalRecordMethods.join(', ')}`)
  } else {
    console.log('\n❌ medicalRecord NÃO está disponível')
  }
  
  await prisma.$disconnect()
}

debugModels()