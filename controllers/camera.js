const sharp = require('sharp')
const { createWorker } = require('tesseract.js')

module.exports.readPicture = async (picture) => {
    const config = {
        tessedit_ocr_engine_mode: '1',
        tessedit_pageseg_mode: '3',
    }
    let bufferData = null
    let outputImagelevel = 'picture'
    sharp(picture)
        .threshold(115)
        .flatten()
        .sharpen(9)
        .modulate({
            brightness: 0.75,
        })
        .toBuffer((e, d, i) => {
            bufferData = d
        })
    //.toFile(outputImagelevel)
    //console.log(outputImagelevel, 'predelana')
    const worker = await createWorker({
        logger: (m) => console.log(m, 'Miha!!!'), // Add logger here
    })
    await worker.loadLanguage('slv')
    await worker.initialize('slv')
    await worker.setParameters(config)
    const { data: data } = await worker.recognize(bufferData)
    await worker.terminate()
    return { data }
}
