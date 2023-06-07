const mongoose = require('mongoose')
const Schema = mongoose.Schema

const debiteSchema = new Schema({
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
    },
    scheduled: {
        type: Boolean,
        required: true,
    },
    debitInputDayInMonth: {
        type: Number,
        required: true,
    },
    debitInputMonthsInYear: {
        type: Array,
        required: true,
    },
})
module.exports = mongoose.model('Debit', debiteSchema)
