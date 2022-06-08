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
		default: new Date()
	},
	payDate: {
		type: Date,
		required: true
	},
	costPeriod: {
		type: Date,
		required: true
	},
	description: {
		type: String
	},
	category: {
		type: String,
		required: true,
		lowercase: true
	},
	subCategory: {
		type: String,
		required: true,
		lowercase: true
	},
	shared: {
		type: Boolean,
		required: true
	}
});
//enum: [ 'home', 'cars', 'food', 'presents', 'pets', 'helth', 'vacation', 'hobby', 'other' ],
module.exports = mongoose.model('Expense', expenseSchema);
