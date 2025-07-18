const whiteList = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8888",
    "http://127.0.0.1:8888",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:63342",
    "http://127.0.0.1:63342",
    "http://localhost:80",
    "http://127.0.0.1:80",
    "http://0.0.0.0:8000"
];

const corsOptions = (req, callback) => {
    const origin = req.header("Origin");
    if (!origin || whiteList.includes(origin)) {
        callback(null, {
            origin: true,
            credentials: true,
        });
    } else {
        console.log("❌ CORS blocked origin:", origin);
        callback(null, { origin: false });
    }
};

module.exports = corsOptions;