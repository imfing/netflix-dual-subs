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

  const playerElement = document.querySelector('[data-uia="player"]');
  if (playerElement) {
    playerElement.appendChild(subtitleContainer);
  } else {
    document.body.appendChild(subtitleContainer); // Fallback if player element is not found
  }

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

// Function to get available languages from local storage
function getAvailableLanguages() {
  const languages = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('subtitle-')) {
      languages.push(key.replace('subtitle-', ''));
    }
  }
  return languages;
}

// Helper function to find the best matching language
function findBestMatchingLanguage(preferredLanguage, availableLanguages) {
  return availableLanguages.find(lang => lang.startsWith(preferredLanguage)) || null;
}

// Modify the loadAndApplySubtitles function to use the simplified matching logic
async function loadAndApplySubtitles(videoElement) {
  const settings = await getSettings();
  console.debug('Settings:', settings);
  const preferredLanguage = settings.preferredLanguage;

  if (!preferredLanguage) {
    console.warn('No preferred language set.');
    return;
  }

  const availableLanguages = getAvailableLanguages();
  console.debug('Available languages:', availableLanguages);

  let language = findBestMatchingLanguage(preferredLanguage, availableLanguages);
  if (!language) {
    console.error(`No subtitles available for ${preferredLanguage}.`);
    return;
  }

  console.debug(`Selected language: ${language}`);
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