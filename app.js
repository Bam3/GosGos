if (process.env.NODE_ENV !== 'production') {
    //s tem rečemo naj pogleda naš .env fajl in ga upošteva, ampak samo ko svmo v dev.
    require('dotenv').config()
}

const open = require('open')
const mongoose = require('mongoose')
const express = require('express')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const session = require('express-session')
const fileUpload = require('express-fileupload')

const User = require('./models/user')

const {
    getAllCategoriesAndUsers,
    createExpense,
    getExpensesForFilter,
    updateExpense,
    deleteExpense,
    getLastExpenses,
    getSingleExpenseById,
} = require('./controllers/expense')

const { readPicture } = require('./controllers/camera')

const { filterByCategoryAndDate } = require('./controllers/filters')

const {
    renderRegister,
    renderLogin,
    logoutUser,
    getLoggedinUser,
} = require('./controllers/users')

const {
    createCategory,
    getCategory,
    getCategoriesToEdit,
    updateCategoriesOrCreate,
    getPopularCategories,
} = require('./controllers/categories')

const { updateSettings } = require('./controllers/settings')

const {
    getAllLoggedInUserDebits,
    createDebit,
    getDebitContext,
    updateDebit,
    deleteDebit,
    deleteCronJob,
} = require('./controllers/debit')

const {
    getLastMonthStartEndDate,
} = require('./public/javascripts/pureFunctions')
// const {
//     getWhiskeyContext,
//     createWhiskey,
//     updateWhiskey,
//     deleteWhiskey,
// } = require('./controllers/whiskey')
// const { createNote, getWishlistContext } = require('./controllers/wishlist')
const { isLoggedIn } = require('./middleware')

//connect to DB
const MongoStore = require('connect-mongo')
const { authenticate } = require('passport')
const { emitKeypressEvents } = require('readline')
const { isEmpty } = require('lodash')

const dbUrl = process.env.DB_URL
//const dbUrl = 'mongodb://localhost:27017/gos-gos'
mongoose.connect(dbUrl)
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
    //in seconds
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
app.set('public', path.join(__dirname, 'public'))
app.use(flash())

// Use the express-fileupload middleware
app.use(fileUpload())
app.use(
    express.urlencoded({
        extended: true,
    }),
)
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
app.get('/', isLoggedIn, async (req, res) => {
    res.redirect('/expenses/new')
})

app.get(
    '/expenses/new',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { users, categories } = await getAllCategoriesAndUsers(req, res)
        const { sharedExpenses, usersExpenses } = await getLastExpenses(
            req,
            res,
        )
        const popularCategories = await getPopularCategories(req)
        const currentHousehold = (await getLoggedinUser(req)).household

        res.render('expenses/create-edit', {
            users,
            categories,
            expense: null,
            sharedExpenses,
            usersExpenses,
            mode: 'create',
            popularCategories: popularCategories,
            currentHousehold,
        })
    }),
)

app.get(
    '/expenses/:id',
    catchAsync(async (req, res) => {
        const expense = await getSingleExpenseById(req, res)
        if (!expense) {
            req.flash('error', 'Iskanega stroška ni moč najti!')
            return res.redirect('/expenses/new')
        }
        res.render('expenses/show', { expense })
    }),
)

app.get(
    '/expenses/:id/edit',
    catchAsync(async (req, res) => {
        const expense = await getSingleExpenseById(req, res)
        const { users, categories } = await getAllCategoriesAndUsers(req, res)
        const popularCategories = await getPopularCategories(req)
        if (!expense) {
            req.flash('error', 'Iskanega stroška ni moč najti!')
            return res.redirect('/expenses/new')
        }
        const currentHousehold = (await getLoggedinUser(req)).household

        res.render('expenses/create-edit', {
            expense,
            users,
            categories,
            mode: 'edit',
            popularCategories,
            currentHousehold,
        })
    }),
)

app.get(
    '/myexpenses',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const from = `${new Date().toISOString().substring(0, 8)}01`
        const to = new Date().toISOString().substring(0, 10)
        return res.redirect(`/expenses?from=${from}&to=${to}&share=${false}`)
    }),
)
app.get(
    '/expenses',
    isLoggedIn,
    catchAsync(async (req, res) => {
        if (
            req.query.lastMonth === 'false' ||
            req.query.lastMonth === undefined
        ) {
            let { from, to, share } = req.query
            if (!from || !to) {
                from = `${new Date().toISOString().substring(0, 8)}01`
                to = new Date().toISOString().substring(0, 10)
                return res.redirect(
                    `/expenses?from=${from}&to=${to}&share=${true}`,
                )
            }
            if (from > to) {
                req.flash('error', 'Začetni datum ne mora biti po končnem!')
                res.redirect('/expenses/new')
            } else {
                const context = await getExpensesForFilter(req, res, {
                    from,
                    to,
                    share,
                })
                res.render('expenses/index', context)
            }
        } else {
            let { from, to } = getLastMonthStartEndDate(req.query.from)
            return res.redirect(`/expenses?from=${from}&to=${to}&share=${true}`)
        }
    }),
)

app.get(
    '/search',
    isLoggedIn,
    catchAsync(async (req, res) => {
        from = `${new Date().toISOString().substring(0, 8)}01`
        to = new Date().toISOString().substring(0, 10)
        const categoriesAndUsers = await getAllCategoriesAndUsers(req, res)
        const context = await filterByCategoryAndDate(req, res)
        res.render('expenses/search', {
            categoriesAndUsers,
            context,
            from,
            to,
        })
    }),
)

app.post(
    '/search',
    isLoggedIn,
    catchAsync(async (req, res) => {
        if (req.body.lastMonth === undefined) {
            const context = await filterByCategoryAndDate(
                req,
                res,
                req.body.filteredByDate,
                req.body.dateFrom,
                req.body.dateTo,
                req.body.category,
                req.body.subCategory,
            )
            const categoriesAndUsers = await getAllCategoriesAndUsers(req, res)
            res.render('expenses/search', {
                context,
                categoriesAndUsers,
            })
        } else {
            let { from, to } = getLastMonthStartEndDate()
            const lastMonths = await getExpensesForFilter(req, res, {
                from,
                to,
                share: 'true',
            })
            res.render('expenses/index', lastMonths)
        }
    }),
)

app.post(
    '/expenses',
    isLoggedIn,
    catchAsync(async (req, res, next) => {
        const newExpenseMessage = await createExpense(req, res)
        if (newExpenseMessage.type === 'error') {
            req.flash(newExpenseMessage.type, newExpenseMessage.message)
            res.redirect('/expenses/new')
            next()
        } else {
            req.flash(newExpenseMessage.type, newExpenseMessage.message)
            res.redirect(`/expenses/${newExpenseMessage.newExpense._id}`)
        }
    }),
)
app.post(
    '/expenses/filter',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const formData = req.body
        res.redirect(
            `/expenses?from=${formData.dateFrom}&to=${formData.dateTo}&share=${formData.share}&lastMonth=${formData.lastMonth}`,
        )
    }),
)

app.put(
    '/expenses/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        updateExpense(req, res)
    }),
)

app.delete(
    '/expenses/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        deleteExpense(req, res)
    }),
)

app.get('/categories/new', isLoggedIn, (req, res) => {
    res.render('categories/new')
})

app.get(
    '/categories/:id/edit',
    catchAsync(async (req, res) => {
        const { id } = req.params
        const categories = await getCategory(req, res, id)
        if (!categories) {
            req.flash('error', 'Iskane kategorije ni moč najti!')
            return res.redirect('/categories')
        }
        res.render('categories/edit', {
            categories,
            id,
        })
    }),
)

app.get(
    '/categories',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const context = await getAllCategoriesAndUsers(req, res)
        res.render('categories/index', context)
    }),
)

app.post(
    '/categories',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const newCategory = await createCategory(req)
        req.flash('success', 'Kategorija dodan in shranjen')
        res.redirect(`/categories/${newCategory._id}/edit`)
    }),
)
app.put(
    '/categories/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        await updateCategoriesOrCreate(req, res, getCategoriesToEdit(req, res))
        res.redirect('/categories')
    }),
)
app.post(
    '/camera/photo',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { picture } = req.files
        const categories = await getAllCategoriesAndUsers(req, res)
        const context = await readPicture(picture.data)
        res.render('expenses/new', categories)
    }),
)

app.get(
    '/debits',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const debits = await getAllLoggedInUserDebits(req, res)
        res.render('debits/index', { debits })
    }),
)

app.get(
    '/debits/new',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const context = await getAllCategoriesAndUsers(req, res)
        res.render('debits/new', { context })
    }),
)

app.post(
    '/debits',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const newDebit = await createDebit(req, res)
        req.flash('success', 'Trajnik dodan in shranjen')
        res.redirect(`/debits`)
    }),
)

app.get(
    '/debits/:id/edit',
    catchAsync(async (req, res) => {
        const context = await getDebitContext(req, res)
        const usersAndCategories = await getAllCategoriesAndUsers(req, res)
        if (!context) {
            req.flash('error', 'Iskanega trajnika ni moč najti!')
            return res.redirect('/debits/new')
        }
        res.render('debits/edit', {
            context,
            usersAndCategories,
        })
    }),
)

app.put(
    '/debits/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        updateDebit(req, res)
    }),
)

app.delete(
    '/debits/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        deleteCronJob(req, res)
        deleteDebit(req, res)
    }),
)
// app.get(
//     '/whiskies/wishlist',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         const context = await getWishlistContext()
//         res.render('whiskies/wishlist/index', context)
//     })
// )

// app.get(
//     '/whiskies/wishlist/new',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         res.render('whiskies/wishlist/new')
//     })
// )

// app.post(
//     '/whiskies/wishlist',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         const newNote = await createNote(req.body)

//         req.flash('success', 'Zapis dodan in shranjen!')
//         res.redirect(`/whiskies/wishlist`)
//     })
// )

// app.get(
//     '/whiskies',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         const context = await getWhiskeyContext()
//         res.render('whiskies/index', context)
//     })
// )

// app.get(
//     '/whiskies/new',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         res.render('whiskies/new')
//     })
// )

// app.get(
//     '/whiskies/:id',
//     catchAsync(async (req, res) => {
//         const id = req.params.id
//         const context = await getWhiskeyContext(id)
//         if (!context) {
//             req.flash('error', 'Iskanega viskija ni moč najti!')
//             return res.redirect('/whiskies')
//         }
//         res.render('whiskies/show', context)
//     })
// )

// app.get(
//     '/whiskies/:id/edit',
//     catchAsync(async (req, res) => {
//         const id = req.params.id
//         const context = await getWhiskeyContext(id)
//         if (!context) {
//             req.flash('error', 'Iskanega viskija ni moč najti!')
//             return res.redirect('/whiskies')
//         }
//         res.render('whiskies/edit', {
//             context,
//         })
//     })
// )

// app.post(
//     '/whiskies',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         const newWhiskey = await createWhiskey(req.body)
//         req.flash('success', 'Viski dodan in shranjen!')
//         res.redirect(`/whiskies/${newWhiskey._id}`)
//     })
// )

// app.put(
//     '/whiskies/:id',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         updateWhiskey(req, res)
//     })
// )

// app.delete(
//     '/whiskies/:id',
//     isLoggedIn,
//     catchAsync(async (req, res) => {
//         deleteWhiskey(req, res)
//     })
// )

app.get('/register', renderRegister)
app.get('/login', renderLogin)
app.get('/logout', logoutUser)
app.get(
    '/settings',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const user = await getLoggedinUser(req)
        const household = user.household
        res.render('users/settings', { user, household })
    }),
)
app.post(
    '/settings',
    isLoggedIn,
    catchAsync(async (req, res) => {
        await updateSettings(req)
        req.flash('success', 'Nastavitve so bile uspešno shranjene.')
        res.redirect(`/settings`)
    }),
)

app.post(
    '/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }),
    async (req, res) => {
        const redirectUrl = req.session.returnTo || '/expenses/new'
        delete req.session.returnTo
        req.flash(
            'success',
            `${req.session.passport.user}, pozdravljen v GosGos!`,
        )
        //on login get users household and save it in session
        const loggedinUser = await getLoggedinUser(req)
        req.session.household = loggedinUser.household._id
        req.session.usersID = loggedinUser._id
        res.redirect(redirectUrl)
    },
)

app.post('/register', async (req, res) => {
    try {
        const { email, username, password, color } = req.body
        const user = new User({
            email,
            username,
            roll: 'user',
            color,
        })
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

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})
//error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(statusCode).render('error', {
        err,
    })
})
//open port&listen
const port = process.env.PORT || 3002
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
    if (process.env.NODE_ENV === 'development') {
        open(`http://localhost:${port}`)
    }
})

//> db.expenses.find({ $and: [{ $expr: { $eq: [{$month: "$payDate" },6]}},{ $expr: { $eq: [{$year: "$payDate" },2021]}}]});
