// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static("public"));

// Socket connection
io.on("connection", (socket) => {
    console.log("New client connected");

    // Listen for drawing events from clients
    socket.on("drawing", (data) => {
        // Broadcast the drawing data to all clients except the sender
        socket.broadcast.emit("drawing", data);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
