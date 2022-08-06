var _ = require('lodash')
const Note = require('../models/note')

module.exports.getWishlistContext = async (id) => {
    let notes = {}
    let note = {}
    if (id) {
        note = await Note.findById(id)
        return { note }
    } else {
        notes = await Note.find({}).sort({ dateOfPurchase: -1 })
        return { notes }
    }
}

module.exports.createNote = async (note) => {
    const newNote = new Note({
        title: note.title,
        content: note.content,
    })
    await newNote.save()

    return newNote
}
