function submitPic() {
    let form = document.getElementById('addNewPhoto')
    form.submit()
}
function readDateFromData(data) {
    let res = data.match(
        /\d(0?[1-9]|1[0-2])([\D|\s]|(\D\s))(0?[1-9]|[12]\d|3[01])([\D|\s]|(\D\s))(19|20)\d{2}/
    )
    //console.log(res, 'direkt datum iz listka')
    if (res !== null) {
        let date = res.toString().replaceAll(' ', '')
        date = date.toString().replaceAll(',', '-')
        date = date.toString().replaceAll('.', '-')
        dateArray = date.split('-')
        date = `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`

        inputDate.setAttribute('value', date)
        //console.log(date, 'Is this a date?')
    }
}
function readPriceFromData(data) {
    let res = data.match(
        /(CENA|SKUPAJ|ZNESEK|EUR|€)(\D\s|\s)?([\d,]+(?:[.,]\d{1,2})?)/s
    )
    //console.log(res, 'cena iz računa')
    if (res !== null) {
        inputPrice.setAttribute('value', res[3])
    }
}
function readCategoryFromData(data) {
    let res = data.match(/(NAKLO|naklo|Naklo)/s)
    //console.log(res, 'kategorija iz računa')
    if (res !== null) {
        if (res[0] === 'NAKLO') {
            inputCategory.innerText = 'Upravnik'
        }
    }
}
function getAllSubCategories(categories) {
    let subCategories = []
    for (const category of categories) {
        for (const subCat of category.subCategories) {
            let option = { name: subCat.name, id: subCat.id }
            subCategories.push(option)
        }
    }
    return subCategories
}
//DOM
let progressBar = document.getElementById('progress')
let progressTitle = document.getElementById('progress-title')
let toastLive = document.getElementById('liveToast')
let dataFromPicture = null
let dataFromPictureRaw = null
let inputDate = document.getElementById('date')
let inputPrice = document.getElementById('price')
let inputCategory = document.getElementById('categoryOption')
let inputDescription = document.getElementById('description')

//if no picture in sessionStorage then hide progress bar
//if (true) {
//     toastLive.setAttribute('class', 'toast fade show')
//     const worker = Tesseract.createWorker({
//         logger: (m) => {
//             //console.log(m, 'a to uporabim?'), console.log(m.progress)
//             progressBar.setAttribute('style', `width: ${m.progress * 100}%`)
//             progressTitle.innerText = m.status.toUpperCase()
//             //when over hide progress bar
//             if (m.progress === 1 && m.status === 'recognizing text')
//                 toastLive.setAttribute('class', 'toast fade hide')
//         },
//     })

// async function readPicture(picture) {
//     await worker.load()
//     await worker.loadLanguage('slv')
//     await worker.initialize('slv')
//     const { data: data } = await worker.recognize(picture)
//     await worker.terminate()
//     return data
// }

// readPicture(getPictureFromSessionStorage('pictureUrl')).then((context) => {
//     clearSessionStorage()
//     //console.log(context.text)
//     //console.log(dataFromPicture, categories)
//     readDateFromData(context.text)
//     readPriceFromData(context.text)
//     inputDescription.innerText = context.text
// })
// } else {
//     toastLive.setAttribute('class', 'toast fade hide')
//     inputDescription.innerText = '...'
// }
