const mongoose = require('mongoose');
const Category = require('../models/category');
const { categories } = require('./categories');

mongoose
	.connect('mongodb://localhost:27017/gos-gos', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('MONGO CONNECTION OPEN!!!');
	})
	.catch((err) => {
		console.log('OH NO MONGO CONNECTION ERROR!!!!');
		console.log(err);
	});
console.log(categories[0].name);
console.log(categories[0].subCategory[0]);
const seedDB = async () => {
	//zbrišem celo bazo Category
	await Category.deleteMany({});
	//grem čez cats in jih ustvarim
	for (let i = 0; i < categories.length; i++) {
		const cat = new Category({
			name: categories[i].name,
			subCategory: categories[i].subCategory
		});
		//console.log(cat);
		await cat.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
