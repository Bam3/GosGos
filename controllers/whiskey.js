var _ = require('lodash')
const Whiskey = require('../models/whiskey')

module.exports.getWhiskeyContext = async () => {
    let whiskies = {}
    whiskies = await Whiskey.find({}).sort({ dateOfPurchase: -1 })

    return { whiskies }
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
