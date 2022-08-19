const subCatColors = [
    'red',
    'blue',
    'yellow',
    'green',
    'white',
    'pink',
    'purple',
]
const labels = [
    'januar',
    'februar',
    'marec',
    'april',
    'maj',
    'junij',
    'julij',
    'avgust',
    'september',
    'oktober',
    'november',
    'december',
]
let datasets = []

for (let i = 0; i < expenses.length; i++) {
    datasets[i] = {
        label: expenses[i].category[0].name,
        data: expenses[i].cost,
        backgroundColor: subCatColors[i],
        stack: 'Stack 0',
    }
}

const data = {
    labels: labels,
    datasets: [
        {
            label: expenses[i].category.name,
            data: expenses[i].cost,
            backgroundColor: subCatColors[i],
            stack: 'Stack 0',
        },
    ],
}

const config = {
    type: 'bar',
    data: data,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Chart.js Bar Chart - Stacked',
            },
        },
        responsive: true,
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    },
}
