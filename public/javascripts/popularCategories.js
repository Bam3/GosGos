const popularCategoryBtn = document.querySelectorAll('[data-quick-category]')
const dropDown = document.querySelector('#category')
popularCategoryBtn.forEach((button) => {
    button.addEventListener('click', (event) => {
        const idFromClickedElement = event.currentTarget.dataset.categoryId
        dropDown.value = idFromClickedElement
    })
})
