const labelsCategories = []
const inputDataCategories = []
const labelsUsers = []
const inputDataUsers = []

//Categories Pie Chart
parentCategoriesObject.forEach((category) => {
    labelsCategories.push(category.name)
    inputDataCategories.push(category.payments)
})

//Users Pie Chart
usersObject.forEach((user) => {
    labelsUsers.push(user.name)
    inputDataUsers.push(user.payments)
})

const dataCategories = {
    datasets: [
        {
            data: inputDataCategories,
            backgroundColor: categoriesColor,
            hoverOffset: 4,
        },
    ],

    labels: labelsCategories,
}

const configCategories = {
    type: 'pie',
    data: dataCategories,
    options: {},
}
const myChart = new Chart(
    document.getElementById('myChartCategories'),
    configCategories
)

const dataUsers = {
    datasets: [
        {
            data: inputDataUsers,
            backgroundColor: usersColor,
            hoverOffset: 4,
        },
    ],

    labels: labelsUsers,
}

const configUsers = {
    type: 'pie',
    data: dataUsers,
    options: {},
}

const myChart2 = new Chart(document.getElementById('myChartUsers'), configUsers)
