const mongoose = require('mongoose')
const Schema = mongoose.Schema

const debiteSchema = new Schema({
    debitOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cost: {
        type: Number,
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
    enable: {
        type: Boolean,
        required: true,
    },
    debitInputDayInMonth: {
        type: Number,
        required: true,
    },
})
module.exports = mongoose.model('Debit', debiteSchema)
