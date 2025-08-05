// Cloudflare R2 Configuration Example
// .env.local dosyasına eklenecek:

// Cloudflare R2 Credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=memoryqr-uploads

// R2 Endpoint URL (replace with your region)
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://uploads.yourdomain.com

// Configuration Options:
// 1. Single Bucket Strategy (Current file structure)
//    - Bucket: memoryqr-uploads
//    - Structure: customer_id/event_id/filename.ext
//    - Pros: Simple, single bucket management
//    - Cons: All data in one bucket

// 2. Per-Customer Bucket Strategy  
//    - Bucket: memoryqr-{customer_id}
//    - Structure: event_id/filename.ext
//    - Pros: Better isolation, easier billing per customer
//    - Cons: More bucket management, R2 bucket limits

// 3. Hybrid Strategy (Recommended)
//    - Main Bucket: memoryqr-uploads
//    - Structure: customer_id/event_id/filename.ext
//    - Custom Domain: uploads.yourdomain.com
//    - CDN: Cloudflare's built-in CDN
