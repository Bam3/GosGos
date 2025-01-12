const addButton = document.querySelector('#addSubCategory')
const deleteButton = document.querySelector('#deleteSubCategory')
const body = document.getElementById('subCatBody')
const form = document.getElementById('updateAddCat')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

addButton.addEventListener('click', (event) => {
    const newDiv = document.createElement('div')
    const newInput = document.createElement('input')
    const switchDivOut = document.createElement('div')
    const switchDivMain = document.createElement('div')
    const switchInput = document.createElement('input')
    const switchInputHidden = document.createElement('input')

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
    switchInput.id = 'flexSwitchCheckSubCat'
    switchInput.role = 'switch'
    switchInput.name = 'subCategoriesActive'
    switchInput.checked = true
    switchInputHidden.classList.add('form-check-input', 'form-control')
    switchInputHidden.type = 'hidden'
    switchInputHidden.id = 'flexSwitchCheckSubCatHidden'
    switchInputHidden.name = 'subCategoriesActive[]'

    newDiv.append(newInput)
    switchDivMain.append(switchInput)
    switchDivMain.append(switchInputHidden)
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

form.addEventListener('submit', () => {
    const allCheckBoxes = document.querySelectorAll('.form-check')
    allCheckBoxes.forEach((checkBox) => {
        if (checkBox.firstElementChild.checked) {
            checkBox.lastElementChild.disabled = true
        }
    })
})
