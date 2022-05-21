const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
	cost: {
		type: Number,
		required: true
	},
	payer: {
		//type: Schema.Types.ObjectId,
		//ref: 'User'
		type: String,
		required: true
	},
	inputDate: {
		type: Date,
		default: Date.now
	},
	payDate: {
		type: Date,
		required: true
	},
	costPeriod: {
		type: String,
		required: true,
		lowercase: true,
		enum: [
			'january',
			'february',
			'march',
			'april',
			'may',
			'june',
			'july',
			'august',
			'september',
			'october',
			'november',
			'december'
		]
	},
	description: {
		type: String
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		required: true
	}
});
//enum: [ 'home', 'cars', 'food', 'presents', 'pets', 'helth', 'vacation', 'hobby', 'other' ],
module.exports = mongoose.model('Expense', expenseSchema);
