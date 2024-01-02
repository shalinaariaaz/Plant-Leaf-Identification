
var dropperArea = document.getElementsByClassName('image-cont')[0];
function resize(img) {
    var maxWidth = dropperArea.clientWidth;
    var maxHeight = dropperArea.clientHeight;
    var width = img.width;
    var height = img.height;

    var aspectRatio = width / height;

    if (width > height) {
        width = maxWidth;
        height = maxWidth / aspectRatio;
    } else {
        height = maxHeight;
        width = maxHeight * aspectRatio;
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    var resizedImg = document.createElement('img');
    resizedImg.src = canvas.toDataURL('image/jpg');

    dropperArea.appendChild(resizedImg);
};

function handleFiles(files) {
    var fileInput = document.getElementById('fileInput');
    
    var file = files[0];
    var imageType = /image.*/;
    if (!file.type.match(imageType)) {
        return;
    }
    processButton.disabled = false;
    dropperArea.innerHTML = '';

    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            resize(img);
        }
    };
    reader.readAsDataURL(file);
}

var uploadButton = document.querySelector('.uploadButton');
uploadButton.addEventListener('click', function() {
    var fileInput = document.getElementById('fileInput');
    fileInput.click();
});

// Add an event listener to the file input
var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function(e) {
    handleFiles(e.target.files);
});


var processButton = document.querySelector('.process'); 
var saveButton = document.getElementById('saveButton');

processButton.addEventListener('click', function() {
    var fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        var file = fileInput.files[0];
        sendFileToBackend(file);
    }
});
function sendFileToBackend(file) {
    
    var formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        document.getElementById('label').innerHTML = data.label;
        // document.getElementById('accuracy').innerHTML = data.accuracy + ' %';

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showProcessedImage(imagePath) {
    var dropperArea = document.getElementsByClassName('dropper')[0];
    dropperArea.innerHTML = '';

    var img = new Image();
    img.src = imagePath + '?timestamp=' + new Date().getTime();

    img.onload = function() {
        resize(img);
    };
}



