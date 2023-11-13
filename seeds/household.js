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
        defaultToSharedExpense: false,
    })
    await newHousehold.save()

    allUsers.forEach(async (user) => {
        user.household = newHousehold._id
        await user.save()
    })
}

module.exports.cosnoleAllHouses = async () => {
    const allHouses = await Household.find({}).populate('members')
    console.log(allHouses[0])
}
