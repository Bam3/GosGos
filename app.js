if (process.env.NODE_ENV !== 'production') {
	//s tem rečemo naj pogleda naš .env fajl in ga upošteva, ampak samo ko svmo v dev.
	require('dotenv').config();
}

const mongoose = require('mongoose');
const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');

const Category = require('./models/category');
const Expense = require('./models/expense');

//connect to DB
const dbUrl = 'mongodb://localhost:27017/gos-gos';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app = express();

//middle ware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

//first connection
app.get('/', (req, res) => {
	res.send('TUKAJ BO APP!');
});

app.get('/expenses/new', async (req, res) => {
	const categories = await Category.find({});
	//console.log({ categories });
	res.render('expenses/new', { categories });
});

app.get('/expenses/:id', async (req, res) => {
	const expense = await Expense.findById(req.params.id);
	res.render('expenses/show', { expense });
});

app.post('/expenses', async (req, res) => {
	const expense = req.body;
	const newExpense = new Expense({
		cost: expense.price,
		payer: 'Miha',
		payDate: expense.payDate,
		costPeriod: expense.costPeriod,
		description: expense.description,
		category: expense.category,
		subCategory: expense.subCategory,
		shared: true
	});
	await newExpense.save();
	console.log(expense);
	res.redirect(`/expenses/${newExpense._id}`);
});

app.post('/expenses', (req, res) => {
	//Add new expense in DB
	console.log(req.body);
	//Redirect Home!
	res.redirect('/');
});
//open port&listen
const port = 3000;
app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
