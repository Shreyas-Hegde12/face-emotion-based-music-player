const video = document.getElementById('video')
const sampler = document.querySelector('.start-sampling');
let watchState = true;
let cooldowntime = false;
const targetElement = document.querySelector('#video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/static/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/static/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
 document.querySelector('#video-container').append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  sampler.style.display ='none';
  setInterval(async () => {
    if (watchState == true && cooldowntime == false){
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, //resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }
  }, 100);
})


//Intersection Observer

// Function to handle element visibility changes
function handleIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is in view
      watchState = true;
      console.log('Element is in view:', watchState);
    } else {
      // Element is out of view
      watchState = false;
      console.log('Element is out of view:', watchState);
    }
  });
}

// Create an IntersectionObserver instance
const observer = new IntersectionObserver(handleIntersection, {
  root: null, // Observe the viewport
  threshold: 0.3 // Trigger when 10% of the element is visible
});

// Start observing the target element
observer.observe(targetElement);


//button click cooldown
function cooldown(){
  cooldowntime=true;
  const cool = setTimeout(function(){cooldowntime=false;},10e3);
}

//pick dominant emotion
function getDominantEmotion(expressions) {
  return Object.keys(expressions).reduce((maxEmotion, currentEmotion) => 
    expressions[currentEmotion] > expressions[maxEmotion] ? currentEmotion : maxEmotion
  );
}