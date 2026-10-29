const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    color: {
        type: String,
        required: true,
    },
    household: {
        type: Schema.Types.ObjectId,
        ref: 'Household',
    },
    nickName: {
        type: String,
        required: true,
    },
    roll: {
        type: String,
    },
    // Personal key for sending payments from the phone, only its hash
    // is stored
    apiKeyHash: {
        type: String,
        select: false,
        index: true,
    },
    apiKeyCreated: {
        type: Date,
    },
})
//ta passpor-local-mongoose nam na našo schemo doda username,
//salt, hash itd...
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)
