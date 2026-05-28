const express = require("express")

const cors = require("cors")

const http = require("http")

const { Server } =
  require("socket.io")

const WebSocket =
  require("ws")

require("dotenv").config()

const connectDB =
  require("./config/db")

const uploadRoutes =
  require("./routes/uploadRoutes")

const app = express()

connectDB()

app.use(cors())

app.use(express.json())

app.use("/upload", uploadRoutes)

app.get("/", (req, res) => {

  res.send("Backend Server Running")
})

const server =
  http.createServer(app)

const io = new Server(server, {

  cors: {
    origin: "http://localhost:5173",
  },
})

io.on("connection", (socket) => {

  console.log("User connected")

  const deepgramSocket =
    new WebSocket(

      "wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true",

      {
        headers: {

          Authorization:
            `Token ${process.env.DEEPGRAM_API_KEY}`,
        },
      }
    )

  deepgramSocket.on("open", () => {

    console.log(
      "Deepgram live connected"
    )

    socket.on(
      "audio-stream",
      (audioChunk) => {

        if (
          deepgramSocket.readyState ===
          WebSocket.OPEN
        ) {

          deepgramSocket.send(audioChunk)
        }
      }
    )
  })

  deepgramSocket.on(
    "message",
    (message) => {

      const data =
        JSON.parse(message)

      const transcript =
        data.channel
          ?.alternatives?.[0]
          ?.transcript

      if (
        transcript &&
        transcript.trim() !== ""
      ) {

        socket.emit(
          "live-transcription",
          transcript
        )
      }
    }
  )

  deepgramSocket.on(
    "error",
    (error) => {

      console.log(
        "Deepgram Error:",
        error
      )
    }
  )

  socket.on("disconnect", () => {

    console.log(
      "User disconnected"
    )

    deepgramSocket.close()
  })
})

const PORT =
  process.env.PORT || 5000

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  )
})