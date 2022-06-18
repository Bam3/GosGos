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
const session = require('express-session')

const Expense = require('./models/expense')
const User = require('./models/user')
const { getNewExpenseContext, createExpense } = require('./controllers/expense')

//connect to DB
const MongoStore = require('connect-mongo')
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
    secret: 'skrivnost',
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

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//first connection
app.get('/', (req, res) => {
    res.redirect('/expenses')
})

app.get('/expenses/new', async (req, res) => {
    const context = await getNewExpenseContext()
    console.log(context)
    res.render('expenses/new', context)
})

app.get('/expenses/:id', async (req, res) => {
    const expense = await Expense.findById(req.params.id)
    res.render('expenses/show', { expense })
})
app.get('/expenses', async (req, res) => {
    //
    const expenses = await Expense.find().sort({ payDate: -1 })
    let sum = 0
    for (const expense of expenses) {
        sum = sum + expense.cost
    }
    res.render('expenses/index', { expenses, sum })
})
app.post('/expenses', async (req, res) => {
    const newExpense = await createExpense(req.body)
    res.redirect(`/expenses/${newExpense._id}`)
})

app.post('/expenses/filter', async (req, res) => {
    const filter = req.body
    const expenses = await Expense.find({
        payDate: {
            $gte: new Date(filter.dateFrom).toISOString(),
            $lt: new Date(filter.dateTo).toISOString(),
        },
    })
    console.log(expenses)
    //let userOne = [];
    //let userTwo = [];
    let sum = 0
    for (const expense of expenses) {
        sum = sum + expense.cost
    }
    res.render('expenses/index', { expenses, sum })
})

app.get('/register', (req, res) => {
    res.render('users/register')
})

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body
        console.log(req.body)
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            //if (err) return next(err);
            //req.flash('success', 'Pozdravljen v GosGos!');
            res.redirect('/')
        })
    } catch (e) {
        //req.flash('error', e.message);
        //res.redirect('/register');
        console.log('napaka!', e)
    }
})

//open port&listen
const port = 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

//> db.expenses.find({ $and: [{ $expr: { $eq: [{$month: "$payDate" },6]}},{ $expr: { $eq: [{$year: "$payDate" },2021]}}]});
