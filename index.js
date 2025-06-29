const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const http = require("http")
const { Server } = require("socket.io")
const Task = require("./task")
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {cors: {origin: "*"}})

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)

io.on("connection", socket => {
    socket.on("update", () => socket.broadcast.emit("refresh"))
})

app.post("/api/token", (req, res) => {
    const t = jwt.sign({email: req.body.email}, process.env.JWT_SECRET)
    res.json({token: t})
})

app.use((req,res,next)=>{
    const h = req.headers.authorization
    if(!h) return res.sendStatus(401)
    try {
        req.u = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET).email
        next()
    } catch {
        res.sendStatus(403)
    }
})

app.post("/api/tasks", async (req, res) => {
    const t = await Task.create({...req.body, owner: req.u})
    res.json(t)
})

app.get("/api/tasks", async (req, res) => {
    const q = { $or: [{ owner: req.u }, { sharedWith: req.u }] }
    const t = await Task.find(q)
    res.json(t)
})

app.put("/api/tasks/:id", async (req, res) => {
    const t = await Task.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
    res.json(t)
})

app.delete("/api/tasks/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id)
    res.sendStatus(204)
})

app.post("/api/tasks/:id/share", async (req,res)=>{
    const t = await Task.findById(req.params.id)
    if (!t.sharedWith.includes(req.body.email)) {
        t.sharedWith.push(req.body.email)
        await t.save()
    }
    res.json(t)
})

server.listen(5000)
