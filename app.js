if (process.env.NODE_ENV !== 'production') {
    //s tem rečemo naj pogleda naš .env fajl in ga upošteva, ampak samo ko svmo v dev.
    require('dotenv').config()
}

const mongoose = require('mongoose')
const express = require('express')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const session = require('express-session')

const Expense = require('./models/expense')
const User = require('./models/user')
const {
    getNewExpenseContext,
    createExpense,
    getExpenseContext,
} = require('./controllers/expense')
const { isLoggedIn } = require('./middleware')

//connect to DB
const MongoStore = require('connect-mongo')
const { authenticate } = require('passport')

//const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://localhost:27017/gos-gos'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const app = express()

const secret = process.env.SECRET || 'skrivnost'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    //v sekundah.
    touchAfter: 24 * 3600,
})

store.on('error', function (e) {
    console.log('SESSION STORE ERROR!', e)
})
const sessionConfig = {
    store,
    //s tem preimenujemo default name cookia
    name: 'Session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // httpOnly je za varnost, cross scripting?
        httpOnly: true,
        //secure: true,
        //nastavimo datom kdaj potece sej, da user ne ostan logiran v ms!
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}

app.use(session(sessionConfig))

//middle ware
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('contollers', path.join(__dirname, 'controllers'))
app.use(flash())

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//local storage for storing things you need in templates...
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//first connection
app.get('/', isLoggedIn, (req, res) => {
    res.redirect('/expenses/new')
})

app.get('/expenses/new', isLoggedIn, async (req, res) => {
    const context = await getNewExpenseContext()
    res.render('expenses/new', context)
})

app.get('/expenses/:id', async (req, res) => {
    const id = req.params.id
    const context = await getExpenseContext({ id })
    console.log(context)
    if (context === undefined) {
        req.flash('error', 'Iskanega stroška ni moč najti!')
        return res.redirect('/expenses/new')
    }
    res.render('expenses/show', context)
})

app.get('/expenses', isLoggedIn, async (req, res) => {
    let { from, to } = req.query
    if (!from || !to) {
        from = `${new Date().toISOString().substring(0, 8)}01`
        to = new Date().toISOString().substring(0, 10)
        return res.redirect(`/expenses?from=${from}&to=${to}`)
    }
    if (from > to) {
        req.flash('error', 'Začetni datum ne mora biti po končnem!')
        res.redirect('/expenses/new')
    } else {
        const context = await getExpenseContext({ from, to })
        res.render('expenses/index', context)
    }
})
app.post('/expenses', isLoggedIn, async (req, res) => {
    const newExpense = await createExpense(req.body)
    req.flash('success', 'Strošek dodan in shranjen')
    res.redirect(`/expenses/${newExpense._id}`)
})

app.post('/expenses/filter', async (req, res) => {
    const formData = req.body
    res.redirect(`/expenses?from=${formData.dateFrom}&to=${formData.dateTo}`)
})

app.get('/register', (req, res) => {
    res.render('users/register')
})

app.get('/login', (req, res) => {
    res.render('users/login')
})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})

app.post(
    '/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }),
    (req, res) => {
        const redirectUrl = req.session.returnTo || '/'
        delete req.session.returnTo
        res.redirect(redirectUrl)
    }
)

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body
        console.log(req.body)
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err) return next(err)
            req.flash('success', 'Pozdravljen v GosGos!')
            res.redirect('/expenses/new')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
        console.log('napaka!', e)
    }
})

//open port&listen
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

//> db.expenses.find({ $and: [{ $expr: { $eq: [{$month: "$payDate" },6]}},{ $expr: { $eq: [{$year: "$payDate" },2021]}}]});
