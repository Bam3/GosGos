const categorySelection = document.querySelector('#category')
const form = document.querySelector('#addNewExpense')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

categorySelection.addEventListener('change', (event) => {
    //store selectet category
    selectedCategoryId = event.target.value
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

    let subCategories = []

    for (const cat of categories) {
        cat.id === selectedCategoryId
            ? (subCategories = cat.subCategories)
            : 'Null'
    }

    subCategories.forEach((subCategory) => {
        const option = document.createElement('option')
        option.value = subCategory._id
        option.text = subCategory.name.toUpperCase()
        newSelection.append(option)
    })
})
