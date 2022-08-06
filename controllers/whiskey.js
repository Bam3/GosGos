var _ = require('lodash')
const Whiskey = require('../models/whiskey')

module.exports.getWhiskeyContext = async (id) => {
    let whiskies = {}
    let whiskey = {}
    if (id) {
        whiskey = await Whiskey.findById(id)
        return { whiskey }
    } else {
        whiskies = await Whiskey.find({}).sort({ dateOfPurchase: -1 })
        return { whiskies }
    }
}

module.exports.createWhiskey = async (whiskey) => {
    const newWhiskey = new Whiskey({
        name: whiskey.name,
        region: whiskey.region,
        dateOfPurchase: new Date(whiskey.dateOfPurchase),
        price: whiskey.price,
        age: whiskey.age,
        comment: whiskey.comment,
    })
    await newWhiskey.save()

    return newWhiskey
}

module.exports.updateWhiskey = async (req, res) => {
    const { id } = req.params
    const expense = await Whiskey.findByIdAndUpdate(id, { ...req.body.whiskey })
    req.flash('success', 'Uspešno posodobljen viski!')
    res.redirect(`/whiskies/${expense._id}`)
}

module.exports.deleteWhiskey = async (req, res) => {
    const { id } = req.params
    await Whiskey.findByIdAndDelete(id)
    req.flash('success', 'Uspešno izbrisan viski!')
    res.redirect('/whiskies')
}
