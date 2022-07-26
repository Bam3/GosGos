const addButton = document.querySelector('#addSubCategory')
const deleteButton = document.querySelector('#deleteSubCategory')
const body = document.getElementById('subCatBody')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

addButton.addEventListener('click', (event) => {
    const newDiv = document.createElement('div')
    const newInput = document.createElement('input')

    newDiv.classList.add('input-group', 'my-3')
    newInput.classList.add('form-control')
    newInput.type = 'text'
    newInput.id = 'SubCategories'
    newInput.name = 'subCategories[]'
    newInput.required = true

    newDiv.append(newInput)
    body.append(newDiv)
})
deleteButton.addEventListener('click', (event) => {
    //zavarujemo elemente ki niso vnosna polja
    if (body.children.length >= 5) {
        body.children[body.children.length - 1].remove()
    }
})
