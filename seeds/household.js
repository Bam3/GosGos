const Household = require('../models/household')
const User = require('../models/user')
module.exports.seedHouseholds = async () => {
    const allUsers = await User.find({})
    let usersIDs = []
    for (const user of allUsers) {
        usersIDs.push(user._id)
    }
    await Household.deleteMany({})
    const newHousehold = new Household({
        name: 'Nataša in Miha',
        address: 'Sončni Log',
        members: usersIDs,
        color: '#152',
    })
    await newHousehold.save()
}

module.exports.cosnoleAllHouses = async () => {
    const allHouses = await Household.find({}).populate('members')
    console.log(allHouses[0])
}

module.exports.changeAllUsers = async () => {
    const allUsers = await User.find({})
    const allHouses = await Household.find({})
    for (const user of allUsers) {
        await User.findByIdAndUpdate(user._id, {
            household: allHouses[0]._id,
        })
    }
    console.log(await User.find({}).populate('household'))
}
