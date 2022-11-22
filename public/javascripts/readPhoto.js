const worker = Tesseract.createWorker({
    logger: (m) => console.log(m), // Add logger here
})

async function readPicture() {
    const data = JSON.parse(sessionStorage.getItem('pictureUrl'))
    console.log(data, 'is picture ok?')
    await worker.load()
    await worker.loadLanguage('slv')
    await worker.initialize('slv')
    const {
        data: { text, paragraphs },
    } = await worker.recognize(data)
    await worker.terminate()
    console.log(paragraphs)
}
readPicture()
