const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = new Schema({
    title: { type: String, require: true },
    content: { type: String, require: true },
    dateOfCreation: { type: Date, default: new Date() },
    cameTrue: { type: Boolean },
})

module.exports = mongoose.model('Note', noteSchema)
