const electron = require('electron');
const { desktopCapturer, remote } = electron;

const { screen: appScreen } = remote;

let timerInterval = null;
let elapsedSeconds = 0;

function getMainSource(desktopCapturer, screen, done) {
  const options = {
    types: ['screen'],
    thumbnailSize: appScreen.getPrimaryDisplay().workAreaSize,
  };
  desktopCapturer
    .getSources(options)
    .then((sources) => {
      const isMainSource = (s) =>
        s.name === 'Entire Screen' || s.name === 'Screen 1' || s.name === 'Entire screen';
      done(sources.filter(isMainSource)[0]);
    })
    .catch((err) => {
      console.log('Cannot capture screen:', err);
    });
}

function getCurrentScreenPosition() {
  const currentDisplay = appScreen.getPrimaryDisplay();
  return {
    width: currentDisplay.workArea.width,
    height: currentDisplay.workArea.height,
  };
}

function displayScreenshot(imageBuffer) {
  const imgContainer = document.getElementById('imageContainer');

  // Clear existing content
  imgContainer.innerHTML = '';

  const { width, height } = getCurrentScreenPosition();

  // Create the image element
  const img = document.createElement('img');
  img.src = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  img.style.maxWidth = '200px';
  img.style.position = 'fixed'; // Fix the image to the bottom-right corner
  img.style.bottom = '20px';    // Set distance from bottom
  img.style.right = '20px';     // Set distance from right
  img.style.border = '1px solid #ccc';
  img.style.borderRadius = '10px';
  img.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.3)';
  img.style.zIndex = '1000';

  // Create the close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '✖';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px'; // Position at the top-right corner of the image
  closeButton.style.right = '5px';
  closeButton.style.backgroundColor = 'red';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.cursor = 'pointer';

  // Add event listener to remove the image
  closeButton.addEventListener('click', () => {
    imgContainer.innerHTML = ''; // Clear the image container
  });

  // Append elements
  imgContainer.appendChild(img);
  imgContainer.appendChild(closeButton);
}

function takeScreenshotAndSend() {
  getMainSource(desktopCapturer, appScreen, (source) => {
    if (!source) return console.log('No screen source found');
    const pngBuffer = source.thumbnail.toPNG();
    displayScreenshot(pngBuffer); // Display the screenshot
  });
}

function startTimer() {
  const timerDisplay = document.getElementById('timer');

  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    if (elapsedSeconds % 30 === 0) {
      takeScreenshotAndSend(); // Take a screenshot and display it
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedSeconds = 0;
  document.getElementById('timer').textContent = '00:00:00';
}

document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('stopTimer').addEventListener('click', stopTimer);
