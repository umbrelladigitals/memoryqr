import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/event/',
          '/_next/',
          '/uploads/',
          '*.json',
          '*.xml',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/event/',
          '/uploads/',
        ],
      },
    ],
    sitemap: 'https://memoryqr.com/sitemap.xml',
    host: 'https://memoryqr.com',
  }
}
