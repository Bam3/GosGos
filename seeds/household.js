const Household = require('../models/household')
module.exports.seedHouseholds = async () => {
    console.log('seedam')
    const newHousehold = new Household({
        name: 'Nataša in Miha',
        address: 'Sončni Log',
        members: [
            '62b0220d04b744701a0bab83',
            '62b021f604b744701a0bab7a',
            '62ba152107ee0fb001590933',
        ],
        color: '#152',
    })
    await newHousehold.save()
}
