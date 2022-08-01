var _ = require('lodash')
const Whiskey = require('../models/whiskey')

module.exports.getWhiskeyContext = async () => {
    let whiskies = {}
    whiskies = await Whiskey.find({}).sort({ dateOfPurchase: -1 })

    return { whiskies }
}
