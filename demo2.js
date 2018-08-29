// Grab elements, create settings, etc.

var button = document.getElementById('snap');
var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        }
    }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
}

button.addEventListener('click', recognizeCamera);
video.addEventListener('click', recognizeCamera);

function recognizeCamera() {
    context.drawImage(video, 0, 0, video.width, video.height);
    console.log(recognizeFile(canvas.toDataURL("image/png")));
}

function progressUpdate(packet) {
    var log = document.getElementById('log');

    if (log.firstChild && log.firstChild.status === packet.status) {
        if ('progress' in packet) {
            var progress = log.firstChild.querySelector('progress')
            progress.value = packet.progress
        }
    } else {
        var line = document.createElement('div');
        line.status = packet.status;
        var status = document.createElement('div')
        status.className = 'status'
        status.appendChild(document.createTextNode(packet.status))
        line.appendChild(status)

        if ('progress' in packet) {
            var progress = document.createElement('progress')
            progress.value = packet.progress
            progress.max = 1
            line.appendChild(progress)
        }


        if (packet.status == 'done') {
            var pre = document.createElement('pre')
            pre.appendChild(document.createTextNode(packet.data.text))
            line.innerHTML = ''
            line.appendChild(pre)

        }

        log.insertBefore(line, log.firstChild)
    }
}

function recognizeFile(file) {
    document.querySelector("#log").innerHTML = ''

    Tesseract.recognize(file, {
        lang: document.querySelector('#langsel').value
    })
        .progress(function (packet) {
            console.info(packet)
            progressUpdate(packet)

        })
        .then(function (data) {
            console.log(data)
            progressUpdate({ status: 'done', data: data })
        })
}