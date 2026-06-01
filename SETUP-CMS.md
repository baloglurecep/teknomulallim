# Canlı CMS Kurulumu (Netlify + Atlas + Cloudinary)

Admin panelinden yapılan değişiklikler **yeniden deploy olmadan** tüm ziyaretçilere yansır.

| Katman | Servis | Ücretsiz tier |
|--------|--------|---------------|
| Site + API | Netlify (static + Functions) | ✓ |
| Metin / proje verisi | MongoDB Atlas M0 | ✓ |
| Video / görsel | Cloudinary | ✓ |

## 1. MongoDB Atlas

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → ücretsiz M0 cluster oluşturun.
2. Database Access → kullanıcı + şifre.
3. Network Access → `0.0.0.0/0` (Netlify Functions için).
4. Connect → **Drivers** → connection string alın (`MONGODB_URI`).

## 2. Cloudinary

1. [cloudinary.com](https://cloudinary.com) hesabı açın.
2. Dashboard → **Cloud name**, **API Key**, **API Secret** değerlerini not edin.

## 3. Netlify ortam değişkenleri

Site → **Environment variables** → `.env.example` içindeki tüm değerleri ekleyin:

- `MONGODB_URI`, `MONGODB_DB`
- `ADMIN_PASSWORD_HASH` — şifrenizin SHA-256 hash'i
- `JWT_SECRET` — rastgele uzun string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SEED_SECRET` — seed URL koruması

Şifre hash üretmek:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('SIFRENIZ').digest('hex'))"
```

## 4. Deploy

Git push veya Netlify CLI ile deploy edin. Build komutu: `npm run build`, publish: `dist`.

## 5. İlk veri yükleme (seed)

Deploy sonrası **bir kez** tarayıcıdan:

```
https://SITENIZ.netlify.app/api/seed?secret=SEED_SECRET_DEGERINIZ
```

Atlas zaten doluysa: `?force=1` ekleyin.

Seed, `public/site-data.json` dosyasını Atlas'a yazar.

## 6. Admin kullanımı

1. `Ctrl+Shift+A` → yönetici şifresi.
2. İçerik düzenle → **Kaydet** → Atlas + Cloudinary güncellenir.
3. Medya yüklemeleri admin oturumu açıkken otomatik Cloudinary'ye gider.

## Yerel geliştirme

```bash
npm install
npm run build
npx netlify dev
```

`.env` dosyasına değişkenleri koyun (`.env.example` şablonu).

API yokken site `site-data.json` ve localStorage ile çalışmaya devam eder.

## API uçları

| Yol | Açıklama |
|-----|----------|
| `GET /api/content` | Herkese açık site verisi |
| `PUT /api/content` | Admin JWT ile kayıt |
| `POST /api/auth/login` | Giriş → JWT |
| `POST /api/media/sign` | Cloudinary imzası |
| `GET /api/seed?secret=...` | Tek seferlik Atlas seed |
