const addButton = document.querySelector('#addSubCategory')
const deleteButton = document.querySelector('#deleteSubCategory')
const body = document.querySelector('#subCatBody')

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

addButton.addEventListener('click', (event) => {
    const newDiv = document.createElement('div')
    const newInput = document.createElement('input')

    newDiv.classList.add('input-group', 'mb-3')
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
// <div class="input-group mb-3">
//                 <input
//                     id="SubCategories"
//                     name="subCategories[]"
//                     type="text"
//                     class="form-control"
//                     required
//                 />
//             </div>
//             <div class="invalid-feedback">Pod kategorija je obvezna.</div>

//remove selection element if exist
// if (document.querySelector('#subCategory')) {
//     document.querySelector('#subCategory').remove()
// }
// //Create and append selection list
// const newSelection = document.createElement('select')
// const newLabel = document.createElement('label')
// newLabel.htmlFor = 'subCategory'
// newLabel.innerText = 'Podkategorija'
// newSelection.name = 'subCategory'
// newSelection.id = 'subCategory'
// newSelection.classList.add('form-select', 'mb-3')
// insertAfter(newLabel, categorySelection)
// insertAfter(newSelection, newLabel)

// let subCats = []
// for (const cat of categories) {
//     cat.name === selectedCategory ? (subCats = cat.subCategory) : 'Null'
// }
// //Create and append opptions
// for (let i = 0; i < subCats.length; i++) {
//     const option = document.createElement('option')
//     option.value = subCats[i]
//     option.text = subCats[i].toUpperCase()
//     newSelection.append(option)
// }
