const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
}

module.exports.getUserOnLogin = async (req, res) => {
    const logedinUser = await User.find({ username: req.session.passport.user })
    return logedinUser[0].household
}
