const User = require('../models/user')

const users = [
    // {
    //     username: 'Miha',
    //     email: 'bastasic.miha@gmail.com',
    //     password: 'miha123',
    // },
    // {
    //     username: 'Nataša',
    //     email: 'natasa.vidmar@gmail.com',
    //     password: 'natasa123',
    // },
    {
        username: 'Revolut',
        email: 'bastasic.revolut@gmail.com',
        password: 'revolut123',
    },
]

module.exports.seedUsers = async () => {
    //await User.deleteMany({})
    await Promise.all(
        users.map(async (user) => {
            const { email, username, password } = user
            const userObject = new User({ email, username })
            console.log(userObject)
            return await User.register(userObject, password)
        })
    )
}
