const User = require('../models/user')
const Household = require('../models/household')
const mongoose = require('mongoose')

const users = [
    {
        username: 'Miha',
        email: 'bastasic.miha@gmail.com',
        password: 'miha123',
        color: '#2A9D8F',
        nickName: 'MB',
    },
    {
        username: 'Nataša',
        email: 'natasa.vidmar@gmail.com',
        password: 'natasa123',
        color: '#E76F51',
        nickName: 'NV',
    },
]

module.exports.seedUsers = async () => {
    await User.deleteMany({})
    const households = await Household.find({})

    await Promise.all(
        users.map(async (user) => {
            const { email, username, password, color, roll, nickName } = user
            const userObject = new User({
                email,
                username,
                color,
                roll,
                nickName,
                household: new mongoose.Types.ObjectId(households[0].id),
            })
            console.log(userObject)
            return await User.register(userObject, password)
        }),
    )
}
