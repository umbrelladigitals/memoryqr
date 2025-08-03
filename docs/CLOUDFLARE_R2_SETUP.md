# Cloudflare R2 Kurulum Rehberi

## 1. Cloudflare R2 Hesap Kurulumu

### Adım 1: Cloudflare Hesabı
1. [Cloudflare Dashboard](https://dash.cloudflare.com)'a giriş yapın
2. Sağ menüden **R2 Object Storage**'ı seçin
3. **Get Started** butonuna tıklayın

### Adım 2: Bucket Oluşturma
1. **Create bucket** butonuna tıklayın
2. Bucket adı: `memoryqr-uploads`
3. Location: **Automatic** (önerilen)
4. **Create bucket** butonuna tıklayın

## 2. API Token Oluşturma

### Adım 1: R2 Token
1. R2 dashboard'dan **Manage R2 API tokens** seçin
2. **Create API token** butonuna tıklayın
3. Token adı: `MemoryQR-API-Token`

### Adım 2: Permissions
Aşağıdaki izinleri seçin:
- ✅ **Object Read**
- ✅ **Object Write** 
- ✅ **Object Delete**

### Adım 3: Resource Restrictions
- **Include - Specific bucket**: `memoryqr-uploads`
- **Account resources**: Include all accounts

### Adım 4: Token Bilgilerini Kaydetme
Token oluşturulduktan sonra aşağıdaki bilgileri kopyalayın:
- **Access Key ID**
- **Secret Access Key**
- **Account ID** (dashboard'da görünür)

## 3. Environment Variables Konfigürasyonu

`.env.local` dosyasını aşağıdaki değerlerle güncelleyin:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_here"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_key_here"
CLOUDFLARE_R2_BUCKET_NAME="memoryqr-uploads"
CLOUDFLARE_R2_ENDPOINT="https://[ACCOUNT_ID].r2.cloudflarestorage.com"
CLOUDFLARE_R2_PUBLIC_URL="https://uploads.yourdomain.com"  # İsteğe bağlı
```

### Endpoint URL'sini Bulma
- ACCOUNT_ID'yi yukarıda kopyaladığınız Account ID ile değiştirin
- Örnek: `https://abc123def456.r2.cloudflarestorage.com`

## 4. Custom Domain Kurulumu (İsteğe Bağlı)

### Adım 1: Domain Ekleme
1. R2 bucket'ınızda **Settings** sekmesine gidin
2. **Public access** bölümünde **Add custom domain** seçin
3. Domain adınızı girin (örn: `uploads.yourdomain.com`)

### Adım 2: DNS Konfigürasyonu
1. DNS sağlayıcınızda CNAME kaydı oluşturun:
   - **Name**: `uploads`
   - **Value**: `memoryqr-uploads.[ACCOUNT_ID].r2.cloudflarestorage.com`

### Adım 3: SSL Sertifikası
Cloudflare otomatik olarak SSL sertifikası sağlayacaktır.

## 5. Test ve Doğrulama

### Bağlantı Testi
```bash
npm run r2:test
```

### Başarılı Test Çıktısı
```
🧪 Testing Cloudflare R2 connection...
📤 Uploading test file...
✅ Upload successful! R2 Key: test-customer/test-event/test-1704726543123.txt
🔗 File URL: https://uploads.yourdomain.com/test-customer/test-event/test-1704726543123.txt
🗑️ Deleting test file...
✅ Delete successful!

🎉 R2 connection test PASSED!
```

## 6. Mevcut Dosyaları Migrate Etme

Eğer halihazırda local dosyalarınız varsa:

```bash
npm run r2:migrate
```

## 7. Dosya Yapısı

R2'da dosyalar şu yapıda saklanır:
```
memoryqr-uploads/
├── customer_1/
│   ├── event_1/
│   │   ├── photo1.jpg
│   │   └── photo2.png
│   └── event_2/
│       └── photo3.jpg
└── customer_2/
    └── event_3/
        └── photo4.jpg
```

## 8. Pricing (Maliyet)

Cloudflare R2 fiyatlandırması:
- **Storage**: $0.015 per GB/month
- **Class A operations** (PUT, COPY): $4.50 per million
- **Class B operations** (GET, SELECT): $0.36 per million
- **Egress**: Ücretsiz (CloudFlare'in avantajı!)

## 9. Sorun Giderme

### Yaygın Hatalar:

1. **"Access Denied"**: API token izinlerini kontrol edin
2. **"Bucket not found"**: Bucket adını ve Account ID'yi kontrol edin
3. **"Invalid credentials"**: Access Key ve Secret Key'i kontrol edin

### Debug Komutları:
```bash
# R2 service log'larını kontrol edin
console.log('R2 Config:', {
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID
})
```

## 10. Güvenlik Önerileri

1. **API Token'ları asla public repository'lerde paylaşmayın**
2. **Minimum gerekli izinleri verin**
3. **Production ve development için farklı bucket'lar kullanın**
4. **Token'ları düzenli olarak rotate edin**
5. **CORS policy'lerini dikkatli ayarlayın**

## 11. Monitoring ve Analytics

Cloudflare Dashboard'da:
- Storage kullanımını takip edin
- Request sayılarını monitör edin
- Bandwidth kullanımını kontrol edin
- Error rate'leri inceleyin

---

Bu rehberi takip ederek Cloudflare R2'yu başarıyla entegre edebilirsiniz. Herhangi bir sorun yaşarsanız lütfen `npm run r2:test` komutunu çalıştırın ve hata mesajlarını kontrol edin.
