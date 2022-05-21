const categorySelection = document.querySelector('#category');
const form = document.querySelector('#addNewExpense');
categorySelection.addEventListener('change', (event) => {
	//from DB
	console.log(categories);
	//selected category from form
	console.log(event.target.value);
	category = event.target.value;
	//Create and append select list
	const newSelect = document.createElement('select');
	newSelect.name = 'subCategory';
	newSelect.id = 'subCategory';
	form.appendChild(newSelect);
	let subCat = [];
	for (const cat of categories) {
		cat.name === category ? (subCats = cat.subCategory) : 'Null';
	}
	//Create and append opptions
	for (let i = 0; i < subCats.length; i++) {
		const option = document.createElement('option');
		option.value = subCats[i];
		option.text = subCats[i].toUpperCase();
		newSelect.append(option);
	}
});
