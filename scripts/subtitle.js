// Function to parse TTML XML
function parseTTML(ttmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(ttmlString, "text/xml");
  const subtitles = [];

  const paragraphs = xmlDoc.getElementsByTagName("p");
  for (const p of paragraphs) {
    const begin = p.getAttribute("begin");
    const end = p.getAttribute("end");
    const text = p.textContent;

    subtitles.push({
      start: timeToSeconds(begin),
      end: timeToSeconds(end),
      text: text
    });
  }

  return subtitles;
}

// Helper function to convert TTML time to seconds
function timeToSeconds(timeString) {
  const ticksPerSecond = 10000000; // Number of ticks in one second
  const timeInTicks = parseInt(timeString, 10); // Convert to integer
  return timeInTicks / ticksPerSecond; // Convert ticks to seconds
}

// Function to load subtitles (can be from local storage or other sources)
function loadSubtitles(language) {
  const ttmlString = localStorage.getItem(`subtitle-${language}`);
  if (!ttmlString) {
    console.error(`No TTML subtitles found for language: ${language}`);
    return null;
  }
  return parseTTML(ttmlString);
}

function applySubtitles(videoElement, subtitles) {
  if (!subtitles) {
    console.error("No subtitles provided");
    return;
  }

  // Create subtitle container
  const subtitleContainer = document.createElement('div');
  subtitleContainer.style.position = 'absolute';
  subtitleContainer.style.width = '100%';
  subtitleContainer.style.textAlign = 'center';
  subtitleContainer.style.color = 'white';
  subtitleContainer.style.textShadow = '1px 1px 1px black';
  subtitleContainer.style.fontSize = '3vh'; // Using viewport height for font size
  subtitleContainer.style.zIndex = '1000';

  document.body.appendChild(subtitleContainer);

  // Function to update subtitle and position
  function updateSubtitleAndPosition() {
    const currentTime = videoElement.currentTime;
    let currentSubtitle = '';

    for (const sub of subtitles) {
      if (currentTime >= sub.start && currentTime <= sub.end) {
        currentSubtitle = sub.text;
        break;
      }
    }

    subtitleContainer.textContent = currentSubtitle;

    const playerTimedTextContainer = document.querySelector('.player-timedtext-text-container');
    if (playerTimedTextContainer) {
      const bbox = playerTimedTextContainer.getBoundingClientRect();
      subtitleContainer.style.bottom = `${window.innerHeight - bbox.bottom - subtitleContainer.offsetHeight - 5}px`;
    }
  }

  // Update subtitle and position on timeupdate event
  videoElement.addEventListener('timeupdate', updateSubtitleAndPosition);

  // Also update position on window resize
  window.addEventListener('resize', updateSubtitleAndPosition);
}

// Function to get settings from content script
function getSettings() {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('getSettings'));
    window.addEventListener('settingsReceived', function onSettingsReceived(event) {
      window.removeEventListener('settingsReceived', onSettingsReceived);
      resolve(event.detail);
    });
  });
}

// Modify the loadAndApplySubtitles function to use the settings
async function loadAndApplySubtitles(videoElement) {
  const settings = await getSettings();
  console.log('Settings:', settings);
  const language = settings.preferredLanguage || 'en'; // Default to English if not set
  const subtitles = loadSubtitles(language);
  if (subtitles) {
    applySubtitles(videoElement, subtitles);
  }
}

// Use a MutationObserver to wait for the video element to be available
const observer = new MutationObserver((mutations, obs) => {
  const videoElement = document.querySelector('[data-uia="video-canvas"] video');
  if (videoElement) {
    console.debug('Video element found:', videoElement);
    obs.disconnect();
    loadAndApplySubtitles(videoElement);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});