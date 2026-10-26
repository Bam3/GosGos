const categoriesLabels = []
const categoriesInputData = []
const categoriesColor = []

//Categories Pie Chart
expensesByCategory.forEach((category) => {
    categoriesLabels.push(category.name)
    categoriesInputData.push(category.sumOfPayments)
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
    configCategories,
)
