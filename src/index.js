import http from "http"
import { app } from "./app.js"
import { Server } from "socket.io"
import * as tf from '@tensorflow/tfjs'
import * as handpose from '@tensorflow-models/hand-pose-detection'
import { createCanvas, loadImage } from 'canvas'

const port = 3000
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', (socket) => {
    console.log("A new client connected with id:", socket.id);
    socket.on("join-room", (data) => {
        console.log("Data=", data);
        const { roomId, emailId } = data;
        console.log("User ", emailId, " Joined room ", roomId);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-joined", { emailId })
    })

    socket.on("call-user", data => {
        const { emailId, sdp, type } = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        console.log("Sending offer SDP is: " + sdp + " and Type is: " + type + " from this email: " + fromEmail + " To " + emailId);
        socket.to(socketId).emit("incomming-call", { from: fromEmail, sdp, type })
    })

    socket.on("call-accepted", data => {
        const { emailId, sdp, type } = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit("call-accepted", { sdp, type })
    })

    socket.on("sensors", (data) => {
        console.log("Get sensors ", data);

        io.emit("sendToUnity", { es: [data] })
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected with id:", socket.id);
    })
})

server.listen(port, () => {
    console.log("Server is running on port ", port);
})
