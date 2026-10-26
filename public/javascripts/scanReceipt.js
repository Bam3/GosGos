//Read a receipt photo on the server and fill the new expense form
const receiptInput = document.querySelector('#receiptPhoto')
const receiptStatus = document.querySelector('#receiptStatus')

//Shrink big phone photos before upload, the server does not need more
const shrinkPhoto = async (file, maxSize = 2400) => {
    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(
            1,
            maxSize / Math.max(bitmap.width, bitmap.height),
        )
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        canvas
            .getContext('2d')
            .drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        return await new Promise((resolve) =>
            canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.9),
        )
    } catch (e) {
        return file
    }
}

const showReceiptStatus = (html, type) => {
    receiptStatus.className = `alert alert-${type} small mt-2 mb-0`
    receiptStatus.innerHTML = html
}

const escapeHtml = (text) =>
    text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

receiptInput.addEventListener('change', async () => {
    const file = receiptInput.files[0]
    if (!file) return
    showReceiptStatus('Berem račun … to lahko traja nekaj sekund.', 'secondary')

    const formData = new FormData()
    formData.append('receipt', await shrinkPhoto(file), 'receipt.jpg')
    let result = null
    try {
        const response = await fetch('/expenses/scan', {
            method: 'POST',
            body: formData,
        })
        result = await response.json()
    } catch (e) {
        result = { error: 'Računa ni bilo mogoče prebrati.' }
    }
    //Allow scanning the same photo again
    receiptInput.value = ''

    if (result.error) {
        showReceiptStatus(escapeHtml(result.error), 'danger')
        return
    }

    const found = []
    const missing = []
    if (result.cost) {
        document.querySelector('#price').value = result.cost.toFixed(2)
        found.push(`cena €${result.cost.toFixed(2)}`)
    } else missing.push('cena')
    if (result.date) {
        document.querySelector('#date').value = result.date
        found.push(`datum ${result.date.split('-').reverse().join('. ')}`)
    } else missing.push('datum')
    if (result.store) {
        const description = document.querySelector('#description')
        if (!description.value.trim()) {
            description.value = [result.store, result.purpose]
                .filter(Boolean)
                .join(' - ')
        }
        found.push(`trgovina ${result.store}`)
    } else missing.push('trgovina')
    if (result.category) {
        document.querySelector('#category').value = result.category.id
        found.push(`kategorija ${result.category.name}`)
    } else missing.push('kategorija')

    showReceiptStatus(
        (found.length
            ? `Prebrano: <b>${escapeHtml(found.join(', '))}</b>.`
            : 'Na računu nisem našel podatkov.') +
            (missing.length
                ? ` Ni najdeno: ${escapeHtml(missing.join(', '))}.`
                : '') +
            ' Preveri podatke pred shranjevanjem.' +
            `<details class="mt-1"><summary>Prebrano besedilo</summary><pre class="mb-0 small">${escapeHtml(result.text || '')}</pre></details>`,
        found.length ? 'success' : 'warning',
    )
})
