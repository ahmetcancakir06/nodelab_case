const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const dbConnect = require('./config/database.js');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('./swagger');
const router = require("./routes");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const corsOptions = require("./helpers/corsOption");
const socketIo = require('socket.io');
const {setupSocket} = require('./socket');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();


// Middlewares
app.use(express.json());
app.use(cors(corsOptions));


// Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate Limiter oluşturma fonksiyonu
function createRateLimiter(windowMs, max, message) {
    return rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true,
        legacyHeaders: false,
    });
}

async function runServer() {
    try {
        await dbConnect();
        await connectRedis();
        await connectRabbitMQ();
        const { startMessageConsumer } = require("./worker/messageConsumer");
        startMessageConsumer();
        // Activate cron jobs
        require("./scheduler/planAutoMessages");
        require("./scheduler/queueAutoMessages");
        // General rate limiter
        const generalLimiter = createRateLimiter(
            360000, // 1 hour in milliseconds
            1000, // 1000 requests per hour
            "Too many requests, please try again later."
        );
        app.get("/", (req, res) => {
            res.send("Welcome to NodeLab API");
        });
        app.use("/api", generalLimiter);

        // Login rate limiter
        const loginRate = createRateLimiter(
            300000, // 5 minutes in milliseconds
            5, // 5 requests per 5 minutes
            "Too many login attempts, please try again later."
        );
        app.use("/api/auth/login", loginRate);
        // Ana router
        app.use("/api", router);

        app.use(errorHandler);

        const PORT = process.env.PORT || 3001;

        const server = require('http').createServer(app);
        const io = socketIo(server, {
            cors: {
                origin: [
                    "http://localhost:3000",
                    "http://localhost:8080",
                    "http://localhost:63342",
                    "http://127.0.0.1:5500",
                    "http://0.0.0.0:8000"
                ],
                methods: ["GET", "POST"],
                credentials: true
            }
        });
   
            setupSocket(io);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });


    } catch (error) {
        console.error("Server error:", error);
        logger.error("Server error:", error);
        process.exit(1);
    }
}

runServer();

module.exports = app;