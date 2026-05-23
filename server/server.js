const express = require("express")
const cors = require("cors")

require("dotenv").config()

const uploadRoutes = require("./routes/uploadRoutes")
const connectDB = require("./config/db")

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.use("/upload", uploadRoutes)

app.get("/", (req, res) => {
  res.send("Backend Server Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})