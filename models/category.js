const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
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
