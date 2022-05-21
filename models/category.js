const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true
	},
	subCategory: {
		type: [ String ],
		lowercase: true
	}
});
module.exports = mongoose.model('Category', categorySchema);
//enum: [ 'home', 'cars', 'food', 'presents', 'pets', 'helth', 'vacation', 'hobby', 'other' ],
