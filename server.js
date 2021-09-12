const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin, getUser, userLeave, getRoomUsers,
} = require('./utils/user');

const app = express();
// Turning on http server
const server = http.createServer(app);

const io = socketio(server);

// Getting acces to static files
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatBot';

// Run when client connect

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ userName, room }) => {
    const user = userJoin(socket.id, userName, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName, `${user.userName} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (message) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.userName, message));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.userName} has left the chat`));

      // // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3001 || process.env.PORT;

server.listen(PORT, () => console.log(`Server in on ${PORT}`));
