// R2'ya geçiş için migration script
import { prisma } from '../src/lib/prisma'
import { r2Service } from '../src/lib/r2-service'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function migrateToR2() {
  console.log('🚀 Starting migration to Cloudflare R2...')
  
  try {
    // Get all uploads from database
    const uploads = await prisma.upload.findMany({
      include: {
        event: {
          include: {
            customer: true
          }
        }
      }
    })

    console.log(`📁 Found ${uploads.length} files to migrate`)

    let successCount = 0
    let errorCount = 0

    for (const upload of uploads) {
      try {
        // Read file from local storage
        const localPath = join(process.cwd(), 'public', upload.filePath)
        const fileBuffer = await readFile(localPath)

        // Upload to R2
        const r2Key = await r2Service.uploadFile({
          customerId: upload.event.customerId,
          eventId: upload.eventId,
          fileName: upload.fileName,
          fileBuffer,
          contentType: upload.mimeType,
        })

        // Update database with new R2 path
        await prisma.upload.update({
          where: { id: upload.id },
          data: {
            filePath: r2Key,
            // Add migration flag to metadata
            metadata: {
              ...(upload.metadata as object || {}),
              migratedToR2: true,
              migrationDate: new Date().toISOString(),
              originalLocalPath: upload.filePath,
            }
          }
        })

        successCount++
        console.log(`✅ Migrated: ${upload.fileName} (${successCount}/${uploads.length})`)

      } catch (error) {
        errorCount++
        console.error(`❌ Error migrating ${upload.fileName}:`, error)
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📁 Total: ${uploads.length}`)

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run migration
if (require.main === module) {
  migrateToR2()
    .then(() => {
      console.log('🎉 Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}
