module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'Najprej se je potrebno prijaviti!')
        return res.redirect('/login')
    }
    next()
}
