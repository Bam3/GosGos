const mongoose = require('mongoose');
const Expense = require('../models/expense');
const { seedCategories } = require('./categories');

mongoose
	.connect('mongodb://localhost:27017/gos-gos', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('MONGO CONNECTION OPEN!!!');
	})
	.catch((err) => {
		console.log('OH NO MONGO CONNECTION ERROR!!!!');
		console.log(err);
	});

const seedDB = async () => {
	await seedCategories()
};

const expensesDB = async () => {
	await Expense.deleteMany({});
};

expensesDB();
seedDB()


console.log("AHA")
