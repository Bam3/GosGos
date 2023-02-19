const mongoose = require('mongoose')
const Schema = mongoose.Schema

const householdSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: false,
    },

    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
    color: {
        type: String, //https://coolors.co/palette/264653-287271-2a9d8f-8ab17d-babb74-e9c46a-efb366-f4a261-ee8959-e76f51
    },
})
module.exports = mongoose.model('Household', householdSchema)
