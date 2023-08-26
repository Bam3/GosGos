const mongoose = require('mongoose')
const Schema = mongoose.Schema

const expenseSchema = new Schema({
    cost: {
        type: Number,
        required: true,
    },
    payer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    inputDate: {
        type: Date,
        default: new Date(),
    },
    payDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    shared: {
        type: Boolean,
        required: true,
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
})
module.exports = mongoose.model('Expense', expenseSchema)
