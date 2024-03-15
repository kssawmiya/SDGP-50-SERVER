const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const ioc = require("socket.io-client");

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_ORIGIN || "http://localhost:3000", // Use environment variable or fallback to "http://localhost:3000"
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    console.log(data);
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    console.log(`test Messgaw:${JSON.stringify(data)}`);
    socket.to(data.room).emit("receive_message", data);
  });
});

app.post("/api/sendMessage", (req, res) => {
  // Extract data from the request body
  console.log(req.body);
  const { room, message } = req.body;

  const socket = ioc(`${process.env.SERVER_ORIGIN}`);
  socket.emit("join_room", room);
  socket.emit("send_message", { message: JSON.stringify(message), room });

  // Send a response back to the client
  res.json({ status: "success", message: "Message received" });
});

const PORT = process.env.PORT || 3001; // Use environment variable or fallback to 3001
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING on port ${PORT}`);
});
