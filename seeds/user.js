const User = require('../models/user')

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
    {
        username: 'Revolut',
        email: 'bastasic.revolut@gmail.com',
        password: 'revolut123',
        color: '#E9C46A',
        roll: 'shared',
        nickName: 'R',
    },
]

module.exports.seedUsers = async () => {
    await User.deleteMany({})
    await Promise.all(
        users.map(async (user) => {
            const { email, username, password, color, roll, nickName } = user
            const userObject = new User({
                email,
                username,
                color,
                roll,
                nickName,
            })
            console.log(userObject)
            return await User.register(userObject, password)
        }),
    )
}
