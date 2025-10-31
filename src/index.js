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

let detector = null;
async function initModel() {
    detector = await handpose.createDetector(handpose.SupportedModels.MediaPipeHands, {
        runtime: 'tfjs',
    })
    console.log('🤖 HandPose model loaded!')
}
await initModel()

io.on('connection', (socket) => {
    console.log("A new client connected with id:", socket.id);

    socket.on("sensors", (data) => {
        console.log("Get sensors ", data);

        io.emit("sendToUnity", { es: [data] })
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected with id:", socket.id);
    })
})

// async function detectHand() {
//   const img = await loadImage('./hand.jpg')
//   const canvas = createCanvas(img.width, img.height)
//   const ctx = canvas.getContext('2d')
//   ctx.drawImage(img, 0, 0)

//   const hands = await tf.tidy(() => detector.estimateHands(canvas))

//   if (hands.length > 0) {
//     const points = hands[0].keypoints3D || hands[0].keypoints
//     io.emit('handData', points)
//     console.log('✋ Sent', points.length, 'points')
//   }

//   tf.engine().startScope() // optional, if used inside loops
//   tf.engine().endScope()
// }

// setInterval(detectHand, 1000)

server.listen(port, () => {
    console.log("Server is running on port ", port);
})
