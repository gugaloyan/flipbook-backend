const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let currentPage = 0;

app.get("/", (req, res) => {
  res.send("✅ Flipbook WebSocket Server is running");
});

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);

  // Сразу после подключения отправляем текущую страницу
  socket.emit("page-flip", currentPage);

  socket.on("page-flip", (pageNumber) => {
    console.log(`🔁 Flip to page ${pageNumber} from ${socket.id}`);
    currentPage = pageNumber;
    socket.broadcast.emit("page-flip", pageNumber);
  });

  socket.on("reset-page", () => {
    console.log(`🔄 Page reset to 0 from ${socket.id}`);
    currentPage = 0;
   io.emit("page-flip", 0);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${PORT}`);
});
