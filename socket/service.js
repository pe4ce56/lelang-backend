const fs = require("fs");
const socketio = require("socket.io");
const handleClient = require("./handleClient");
const status = require("../utils/scheduller");
const service = (http) => {
  const io = socketio(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    socket.on("joinRoom", (room) => {
      socket.join(room);
      socket.room = room;
    });
    socket.on("ChangeCategories", function (data) {
      io.emit("categories", data);
    });
    socket.on("disconnect", () => {
      socket.removeAllListeners();
      // hapus folder temp
      fs.rmdirSync(`public/items_image/temp/${socket.id}`, { recursive: true });
    });

    handleClient(io, socket);
    status(io, socket);
  });
};
module.exports = service;
