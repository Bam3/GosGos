const mongoose = require('mongoose')
const Schema = mongoose.Schema

// A payment sent from a phone (Apple Pay, bank SMS) that still has to be
// confirmed before it becomes an expense
const pendingPaymentSchema = new Schema({
    household: {
        type: Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    merchant: {
        type: String,
    },
    payDate: {
        type: Date,
        required: true,
    },
    source: {
        type: String,
    },
    card: {
        type: String,
    },
    text: {
        type: String,
    },
    // Guessed category, can be changed before confirming
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
    },
    inputDate: {
        type: Date,
        default: Date.now,
    },
})
module.exports = mongoose.model('PendingPayment', pendingPaymentSchema)
