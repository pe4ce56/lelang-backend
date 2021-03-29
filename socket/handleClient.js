module.exports = handleClient = (io, socket) => {

  socket.on("bid", ({room,data}) => {
    socket.broadcast.to(room).emit("bidChanged",data);
  });
  socket.on("comment", (room) => {
    io.in(room).emit("commentChanged");
  });
};
