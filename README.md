# 🚀 NodeLab – Gerçek Zamanlı Mesajlaşma ve Görev Tabanlı Backend Sistemi

Bu proje, Node.js tabanlı, gerçek zamanlı mesajlaşma, kullanıcı yönetimi, RabbitMQ kuyruk sistemi, Redis üzerinden online kullanıcı takibi ve cron job işlemlerini içeren bir backend mimarisidir.

---

## 🔧 Kullanılan Teknolojiler

- **Backend & API:** Node.js, Express.js
- **Veritabanı:** MongoDB, Mongoose
- **Gerçek Zamanlı:** Socket.IO, Redis
- **Mesaj Kuyruğu:** RabbitMQ (CloudAMQP)
- **Kimlik Doğrulama:** JWT, Rate Limiting, Input Validation, Helmet
- **Zamanlayıcılar:** Cron Jobs
- **Loglama:** Winston
- **Dokümantasyon:** Swagger
- **Containerization:** Docker

---

## 🌐 Canlı Test Linkleri

- 🔐 **Giriş Paneli (Frontend):**  
  https://ahmetlab.tech/chat/login

- 📘 **Swagger API Dokümantasyonu (Backend):**  
  https://chatapi.ahmetlab.tech/api-docs
---

## 📦 Proje Yapısı

```
nodelab_case/
├── config/
├── controllers/
├── helpers/
├── logs
├── middlewares/
├── models/
├── routes/
├── scheduler/           
├── socket/
├── utils/              
├── worker/              
├── swagger.js
├── Dockerfile
├── docker-compose.yml
├── .env
└── index.js
```

---

## 🧪 API Test (Swagger)

- API dokümantasyonu için:
```
/api-docs
```


---
## ⚙️ Ortam Değişkenleri (.env örneği)

```env
PORT=3000
JWT_SECRET=super-secret-key

MONGO_URI=mongodb+srv://kullanici:parola@cluster.mongodb.net/db
REDIS_URL=redis://default:parola@host:6379
RABBITMQ_URL=amqps://kullanici:parola@lemur.cloudamqp.com/vhost
TOKEN_TIME=3600
REFRESH_TOKEN_TIME=604800
NODE_ENV=development
MAX_RETRY_COUNT=3
```

---


## ⚡ Gerçek Zamanlı Özellikler

| Özellik             | Açıklama |
|---------------------|---------|
| `join_room`         | Kullanıcı bir sohbete katılır |
| `send_message`      | Gerçek zamanlı mesaj gönderimi |
| `message_received`  | Alıcıya mesaj bildirimi |
| `user_online`       | Redis üzerinden online kullanıcı yayını |
| `disconnect`        | Kullanıcının çıkışı yayılır |

---

## 🔁 Otomatik Mesaj Sistemi

1. `planAutoMessages.js`: Her gece 02:00'da mesaj çiftlerini oluşturur.
2. `queueAutoMessages.js`: Gönderim zamanı gelen mesajları kuyruğa atar.
3. `messageConsumer.js`: Kuyruktan gelen mesajları işler ve Socket.IO ile yayar.

---

## 🧩 Ekstra Özellikler

### 🔐 Güvenlik Özellikleri

- ✅ JWT ile kimlik doğrulama
- ✅ Helmet ile HTTP güvenlik başlıkları
- ✅ Rate limiting (DDOS önleme)
- ✅ Input validation (XSS/Injection koruması)
- ✅ MongoDB'de `deleted` alanı için indexleme
- ✅ Winston ile detaylı loglama


---

## 📄 Lisans

Bu proje değerlendirme amaçlı hazırlanmıştır. Herhangi bir ticari kullanımı yoktur.