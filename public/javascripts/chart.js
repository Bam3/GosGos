const labels = []
const inputData = []
const labels1 = []
const inputData1 = []

parentCategoriesObject.forEach((category) => {
    labels.push(category.name)
    inputData.push(category.payments)
})

usersObject.forEach((user) => {
    labels1.push(user.name)
    inputData1.push(user.payments)
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

const data1 = {
    datasets: [
        {
            data: inputData1,
            backgroundColor: ['#0073ff', '#ffb10a', '#ff7890'],
            hoverOffset: 4,
        },
    ],

    labels: labels1,
}

const config = {
    type: 'pie',
    data: data,
    options: {},
}

const config1 = {
    type: 'pie',
    data: data1,
    options: {},
}
const myChart = new Chart(document.getElementById('myChart1'), config)

const myChart2 = new Chart(document.getElementById('myChart2'), config1)
