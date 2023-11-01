const User = require('../models/user')
const Household = require('../models/household')

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

module.exports.getLoggedinUser = async (req) => {
    const loggedinUser = await User.findOne({
        username: req.session.passport.user,
    }).populate('household')
    return loggedinUser
}
