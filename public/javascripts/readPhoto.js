//client side storage
function getPictureFromSessionStorage(name) {
    return JSON.parse(sessionStorage.getItem(name))
}
function clearSessionStorage() {
    sessionStorage.clear()
}
//DOM
let progressBar = document.getElementById('progress')
let progressTitle = document.getElementById('progress-title')
let toastLive = document.getElementById('liveToast')
let dataFromPicture = null

//if no picture in sessionStorage then hide progress bar
if (getPictureFromSessionStorage('pictureUrl')) {
    toastLive.setAttribute('class', 'toast fade show')
    const worker = Tesseract.createWorker({
        logger: (m) => {
            console.log(m, 'a to uporabim?'), console.log(m.progress)
            progressBar.setAttribute('style', `width: ${m.progress * 100}%`)
            progressTitle.innerText = m.status.toUpperCase()
            //when over hide progress bar
            if (m.progress === 1 && m.status === 'recognizing text')
                toastLive.setAttribute('class', 'toast fade hide')
        },
    })

    async function readPicture(picture) {
        await worker.load()
        await worker.loadLanguage('slv')
        await worker.initialize('slv')
        const {
            data: { text, paragraphs },
        } = await worker.recognize(picture)
        await worker.terminate()
        return paragraphs
    }

    readPicture(getPictureFromSessionStorage('pictureUrl')).then((context) => {
        dataFromPicture = context
        clearSessionStorage()
    })
} else {
    toastLive.setAttribute('class', 'toast fade hide')
}
