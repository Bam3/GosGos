const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        color: {
            type: String, //https://coolors.co/palette/264653-287271-2a9d8f-8ab17d-babb74-e9c46a-efb366-f4a261-ee8959-e76f51
        },
    },
    {
        toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
        toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
    }
)

categorySchema.virtual('subCategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory',
})

module.exports = mongoose.model('Category', categorySchema)
