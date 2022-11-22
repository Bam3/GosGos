const { createWorker } = require('tesseract.js')
const worker = createWorker({
    logger: (m) => console.log(m, 'Miha!!!'), // Add logger here
})

module.exports.readPicture = async () => {
    await worker.load()
    await worker.loadLanguage('slv')
    await worker.initialize('slv')
    //const pictureUrl = sessionStorage.getItem('pictureURL')
    //console.log(pictureUrl)
    const {
        data: { text, paragraphs },
    } = await worker.recognize(pictureUrl)
    console.log(paragraphs, 'inside Tesseract')
    console.log(data, 'inside app')
    dataOut.innerText = text
    await worker.terminate()
    return paragraphs
}
