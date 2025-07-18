# 🚀 NodeLab - Gerçek Zamanlı Mesajlaşma Sistemi

Bu proje, Node.js tabanlı, gerçek zamanlı mesajlaşma, kullanıcı yönetimi, RabbitMQ kuyruk sistemi, Redis üzerinden online kullanıcı takibi ve cron job işlemlerini içeren bir backend mimarisidir.

---

## 🔧 Kullanılan Teknolojiler

- **Node.js + Express.js** — Backend API
- **MongoDB** — NoSQL veritabanı
- **Redis** — Online kullanıcı takibi
- **RabbitMQ** — Kuyruk yönetimi (CloudAMQP ile)
- **Socket.IO** — Gerçek zamanlı mesajlaşma
- **JWT** — Kimlik doğrulama
- **Cron Jobs** — Otomatik mesaj zamanlamaları
- **Winston** — Log yönetimi
- **Swagger** — API dokümantasyonu
- **Docker** — Geliştirici ortamı
- **Rate Limiting & Input Validation** — Güvenlik

---

## 📦 Proje Yapısı

```
nodelab_case/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── socket/
├── scheduler/           # planAutoMessages, queueAutoMessages
├── worker/              # messageConsumer.js
├── utils/               # logger, error handler
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

- Swagger UI ile dökümantasyon
- Winston loglama sistemi
- Rate limiting ve input validation
- Docker ile lokal geliştirme kolaylığı

---

## 📄 Lisans

Bu proje değerlendirme amaçlı hazırlanmıştır. Herhangi bir ticari kullanımı yoktur.