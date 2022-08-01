const Whiskey = require('../models/whiskey')
const allWhiskies = require('./whiskies')

module.exports.seedWhiskies = async () => {
    const promises = []

    await Whiskey.deleteMany({})

    allWhiskies.forEach(async (whiskey) => {
        const newWhiskey = new Whiskey({
            name: whiskey.name,
            region: whiskey.region,
            dateOfPurchase: new Date(whiskey.dateOfPurchase),
            price:
                typeof whiskey.price == 'string'
                    ? (whiskey.price = Number(whiskey.price.replace(',', '.')))
                    : whiskey.price,
            age: whiskey.age,
            comment: whiskey.comment,
        })
        console.log(newWhiskey)
        promises.push(newWhiskey.save())
    })
    await Promise.all(promises)
}
