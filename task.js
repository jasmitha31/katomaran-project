const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    dueDate: Date,
    priority: String,
    owner: String,
    sharedWith: [String]
})

module.exports = mongoose.model("Task", taskSchema)
