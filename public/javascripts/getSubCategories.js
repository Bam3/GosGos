const categorySelection = document.querySelector('#category')
const form = document.querySelector('#addNewExpense')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

categorySelection.addEventListener('change', (event) => {
    //store selectet category
    selectedCategory = event.target.value
    //remove selection element if exist
    if (document.querySelector('#subCategory')) {
        document.querySelector('#subCategory').remove()
    }
    //Create and append selection list
    const newSelection = document.createElement('select')
    const newLabel = document.createElement('label')
    newLabel.htmlFor = 'subCategory'
    newLabel.innerText = 'Podkategorija'
    newSelection.name = 'subCategory'
    newSelection.id = 'subCategory'
    newSelection.classList.add('form-select', 'mb-3')
    insertAfter(newLabel, categorySelection)
    insertAfter(newSelection, newLabel)

    let subCats = []
    for (const cat of categories) {
        cat.name === selectedCategory ? (subCats = cat.subCategory) : 'Null'
    }
    //Create and append opptions
    for (let i = 0; i < subCats.length; i++) {
        const option = document.createElement('option')
        option.value = subCats[i]
        option.text = subCats[i].toUpperCase()
        newSelection.append(option)
    }
})
