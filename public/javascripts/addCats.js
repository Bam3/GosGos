const addButton = document.querySelector('#addSubCategory')
const deleteButton = document.querySelector('#deleteSubCategory')
const body = document.getElementById('subCatBody')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

addButton.addEventListener('click', (event) => {
    const newDiv = document.createElement('div')
    const newInput = document.createElement('input')
    const switchDivOut = document.createElement('div')
    const switchDivMain = document.createElement('div')
    const switchInput = document.createElement('input')

    //creating inout for category name
    newDiv.id = 'subcategory'
    newDiv.classList.add('input-group', 'my-3')
    newInput.id = 'SubCategories'
    newInput.classList.add('form-control')
    newInput.type = 'text'
    newInput.name = 'subCategories[]'
    newInput.required = true
    //creating active setting for the category
    switchDivOut.classList.add('mt-2', 'mx-2', 'px-2')
    switchDivMain.classList.add('form-check', 'form-switch', 'col-2')
    switchInput.classList.add('form-check-input', 'form-control')
    switchInput.type = 'checkbox'
    switchInput.id = 'flexSwitchCheckDefault'
    switchInput.role = 'switch'
    switchInput.name = 'subCategoriesActive[]'
    switchInput.checked = true

    newDiv.append(newInput)
    switchDivMain.append(switchInput)
    switchDivOut.append(switchDivMain)

    newDiv.append(switchDivOut)
    body.append(newDiv)
})
deleteButton.addEventListener('click', (event) => {
    const subcategories = document.querySelectorAll('#subcategory')
    if (subcategories.length > 0) {
        subcategories[subcategories.length - 1].remove()
    }
})
