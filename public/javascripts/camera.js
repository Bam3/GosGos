let width = 720 // We will scale the photo width to this
let height = 1280 // This will be computed based on the input stream

let streaming = false

let video = null
let canvas = null
let startbutton = null
let dataOut = null

function startup() {
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    startbutton = document.getElementById('startbutton')
    dataOut = document.getElementById('data-output')
}
startup()
const constraints = {
    audio: false,
    video: {
        facingMode: 'environment',
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 360, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
    },
}
navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream
        video.play()
    })
    .catch((err) => {
        console.error(`An error occurred: ${err}`)
    })
video.addEventListener(
    'canplay',
    (ev) => {
        console.log(video.videoHeight, video.videoWidth, 'inside Canplay')
        if (!streaming) {
            video.setAttribute('width', width)
            video.setAttribute('height', height)
            canvas.setAttribute('width', width)
            canvas.setAttribute('height', height)
            streaming = true
        }
    },
    false
)
startbutton.addEventListener(
    'click',
    (ev) => {
        data = takepicture()
        sessionStorage.clear()
        sessionStorage.setItem('pictureUrl', JSON.stringify(data))
        console.log(sessionStorage.getItem('pictureUrl'))
    },
    false
)

function takepicture() {
    const context = canvas.getContext('2d', { colorSpace: 'srgb' })
    if (width && height) {
        canvas.width = width
        canvas.height = height
        console.log('inside takepicture', width, height)
        context.drawImage(video, 0, 0, width, height)
        const data = canvas.toDataURL('image/jpg')
        return data
    }
}
