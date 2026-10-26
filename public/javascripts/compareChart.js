//Line chart: one line per year so the same months can be compared
//https://coolors.co/palette/264653-287271-2a9d8f-8ab17d-babb74-e9c46a-efb366-f4a261-ee8959-e76f51
const yearColors = [
    '#264653',
    '#2A9D8F',
    '#E9C46A',
    '#F4A261',
    '#E76F51',
    '#8AB17D',
    '#287271',
    '#EE8959',
]

const compareDatasets = series.map((entry, i) => ({
    label: String(entry.year),
    data: entry.months,
    borderColor: yearColors[i % yearColors.length],
    backgroundColor: yearColors[i % yearColors.length],
    tension: 0.2,
}))

new Chart(document.getElementById('compareChart'), {
    type: 'line',
    data: {
        labels: monthLabels,
        datasets: compareDatasets,
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 12 },
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label}: €${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: (value) => `€${value}` },
            },
        },
    },
})
