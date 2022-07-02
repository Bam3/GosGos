let labels = []
expenses.map((expense) => {
    labels.push(expense.category.parentCategory.name)
})
labels = [...new Set(labels)]

const data = {
    labels: labels,
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        },
    ],
}

const config = {
    type: 'pie',
    data: data,
    options: {},
}
console.log(expenses)
console.log(labels)
const myChart = new Chart(document.getElementById('myChart'), config)
