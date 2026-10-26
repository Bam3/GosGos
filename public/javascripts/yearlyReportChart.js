//Stacked bar chart: one bar per month, one stack segment per category
const yearlyReportDatasets = categoryRows.map((row) => ({
    label: row.name,
    data: row.months,
    backgroundColor: row.color || '#adb5bd',
}))

new Chart(document.getElementById('yearlyReportChart'), {
    type: 'bar',
    data: {
        labels: monthLabels,
        datasets: yearlyReportDatasets,
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
            x: { stacked: true },
            y: {
                stacked: true,
                ticks: { callback: (value) => `€${value}` },
            },
        },
    },
})
