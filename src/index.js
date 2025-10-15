import http from "http"
import { app } from "./app.js"
import { Server } from "socket.io"

const port = 3000
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log("A new client connected with id:", socket.id);
    
    socket.on("sensors", (data) => {
        console.log("Get sensors ", data);

        io.emit("sendToUnity", {es: [data]})
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected with id:", socket.id);
    })
})

server.listen(port, () => {
    console.log("Server is running on port ", port);
})
