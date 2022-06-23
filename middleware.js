module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        console.log(req.session)
        return res.redirect('/login')
    }
    next()
}
