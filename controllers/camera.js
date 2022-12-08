const { createWorker } = require('tesseract.js')
const worker = createWorker({
    logger: (m) => m, //console.log(m, 'Miha!!!'), // Add logger here
})

module.exports.readPicture = async (picture) => {
    await worker.load()
    await worker.loadLanguage('slv')
    await worker.initialize('slv')
    const { data: data } = await worker.recognize(picture)
    await worker.terminate()
    return { data }
}
