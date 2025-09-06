require('dotenv').config()
const { Server } = require('socket.io');
const express = require("express");
const http = require('http');
const path = require('path')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))

const httpServer = http.createServer(app);

const io = new Server(httpServer);

let user = 0;

io.on("connection", (socket) => {
    user++;
    io.emit("user-connected", user);

    socket.on("send-msg", (data) => {
        socket.broadcast.emit("receive-msg", data)
    })

    socket.on("typing", () => {
        socket.broadcast.emit("typing")
    })

    socket.on("clear-chat", () => {
        io.emit("clear-chat")
    })
    
    socket.on('disconnect', () => {
        user--;
        console.log('user disconnected');
    })

});


app.get('/', (req, res) => {
    res.sendFile('index.html')
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
    console.log("server is running on port 3000");

})