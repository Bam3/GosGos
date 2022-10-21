//Select elements
const selectedCategory = document.querySelector('#category')
const selectSubCategory = document.querySelector('#subCategory')
//Listen to when the value changes
selectedCategory.addEventListener('change', (event) => {
    //Delete all sub categories before loading new
    if (selectSubCategory.children.length > 1) {
        while (selectSubCategory.children.length > 0) {
            selectSubCategory.lastChild.remove()
        }
    }
    //Get new value
    const selectedCategoryName = event.target.value
    for (const category of categories) {
        //Check category name and draw all sub categories
        if (category.name === selectedCategoryName) {
            for (const subCategory of category.subCategories) {
                const newOption = document.createElement('option')
                newOption.value = subCategory.name
                newOption.innerHTML = subCategory.name
                selectSubCategory.append(newOption)
            }
        }
    }
})
