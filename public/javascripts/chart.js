const categoriesLabels = []
const categoriesInputData = []
const usersLabels = []
const usersInputData = []
const usersColor = []
const categoriesColor = []

//Categories Pie Chart
parentCategoriesObject.forEach((category) => {
    categoriesLabels.push(category.name)
    categoriesInputData.push(category.payments)
    categoriesColor.push(category.color)
})

const dataCategories = {
    datasets: [
        {
            data: categoriesInputData,
            backgroundColor: categoriesColor,
            hoverOffset: 4,
        },
    ],

    labels: categoriesLabels,
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

//Users Pie Chart
usersObject.forEach((user) => {
    usersLabels.push(user.name)
    usersInputData.push(user.payments)
    usersColor.push(user.color)
})

const dataUsers = {
    datasets: [
        {
            data: usersInputData,
            backgroundColor: usersColor,
            hoverOffset: 4,
        },
    ],

    labels: usersLabels,
}

const configUsers = {
    type: 'pie',
    data: dataUsers,
    options: {},
}

const myChart2 = new Chart(document.getElementById('myChartUsers'), configUsers)
