const User = require('../models/user')

const users = [
    {
        username: 'Miha',
        email: 'bastasic.miha@gmail.com',
        password: 'miha123',
    },
    {
        username: 'Nataša',
        email: 'natasa.vidmar@gmail.com',
        password: 'natasa123',
    },
]

module.exports.seedUsers = async () => {
    await User.deleteMany({})
    await Promise.all(
        users.map(async (user) => {
            const { email, username, password } = user
            const userObject = new User({ email, username })
            return new Promise((resolve) => {
                User.register(userObject, password, () => {
                    resolve(true)
                })
            })
        })
    )
}
