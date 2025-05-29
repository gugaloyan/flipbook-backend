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
  res.send("📘 Flipbook server working");
});

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);

  socket.on("join", (role) => {
    console.log(`👤 ${socket.id} joined as ${role}`);

    if (role === "reader") {
      currentPage = 0;
      io.emit("page-flip", 0);
      console.log("🔄 Reset page to 0 for all (reader joined)");
    } else {
      socket.emit("page-flip", currentPage);
      console.log(`➡ Sending current page (${currentPage}) to viewer`);
    }
  });

  socket.on("page-flip", (pageNumber) => {
    currentPage = pageNumber;
    socket.broadcast.emit("page-flip", pageNumber);
    console.log(`🔁 Flip to page ${pageNumber} from ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${PORT}`);
});
