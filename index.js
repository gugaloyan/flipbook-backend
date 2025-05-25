const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Разрешить все источники (только для разработки!)
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Храним текущий номер страницы (в оперативной памяти)
let currentPage = 0;

app.get("/", (req, res) => {
  res.send("Socket.IO Flipbook Server Running ✅");
});

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);

  // ➤ Отправляем текущую страницу сразу после подключения
  socket.emit("page-flip", currentPage);

  // ➤ Слушаем события перелистывания от "reader"
  socket.on("page-flip", (pageNumber) => {
    console.log(`🔁 Page flip to: ${pageNumber} from ${socket.id}`);

    // Обновляем глобальное значение
    currentPage = pageNumber;

    // Рассылаем другим клиентам
    socket.broadcast.emit("page-flip", pageNumber);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${PORT}`);
});
