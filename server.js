// // server.js
// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Serve static files from the public directory
// app.use(express.static("public"));

// // Socket connection
// io.on("connection", (socket) => {
//     console.log("New client connected");

//     // Listen for drawing events from clients
//     socket.on("drawing", (data) => {
//         // Broadcast the drawing data to all clients except the sender
//         socket.broadcast.emit("drawing", data);
//     });

//     // Handle disconnect event
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//     });
// });

// // Start the server
// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

// Serve the client files
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Listen for drawing events
    socket.on('drawing', (data) => {
        // Broadcast the drawing data to all clients in the room
        socket.to(data.roomId).emit('drawing', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

