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
    image: Image,

    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
    },
})
module.exports = mongoose.model('Household', householdSchema)
//enum: [ 'home', 'cars', 'food', 'presents', 'pets', 'helth', 'vacation', 'hobby', 'other' ],
