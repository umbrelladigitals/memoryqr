import QRCode from 'qrcode'
import { nanoid } from 'nanoid'

export async function generateQRCode(eventId: string): Promise<string> {
  const qrData = `${process.env.APP_URL}/event/${eventId}`
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return qrCodeDataURL
  } catch (error) {
    console.error('QR kod oluşturulurken hata:', error)
    throw new Error('QR kod oluşturulamadı')
  }
}

export function generateEventCode(): string {
  return nanoid(12) // 12 karakterlik benzersiz kod
}

export function getEventUploadUrl(eventCode: string): string {
  return `${process.env.APP_URL}/event/${eventCode}`
}
