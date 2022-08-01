const mongoose = require('mongoose')
const Schema = mongoose.Schema

const whiskeySchema = new Schema({
    name: { type: String, require: true },
    region: { type: String },
    dateOfPurchase: { type: Date, require: true },
    price: {
        type: Number,
        require: true,
    },
    age: {
        type: String,
        require: true,
    },
    comment: {
        type: String,
    },
})

module.exports = mongoose.model('Whiskey', whiskeySchema)
