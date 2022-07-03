const labels = []
const inputData = []
parentCategoriesObject.forEach((category) => {
    labels.push(category.name)
    inputData.push(category.payments.reduce((a, b) => a + b, 0))
})

const data = {
    datasets: [
        {
            data: inputData,
            backgroundColor: [
                '#0073ff',
                '#47b6ff',
                '#57d2ff',
                '#ffd119',
                '#ffb10a',
                '#ff8000',
                '#ff6314',
                '#ff7890',
            ],
            hoverOffset: 4,
        },
    ],

    labels: labels,
}

const config = {
    type: 'pie',
    data: data,
    options: {},
}
const myChart = new Chart(document.getElementById('myChart'), config)
