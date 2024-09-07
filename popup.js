document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const language1Select = document.getElementById('language1');
  const language2Select = document.getElementById('language2');

  saveButton.addEventListener('click', function() {
    const primaryLanguage = language1Select.value;
    const secondaryLanguage = language2Select.value;

    chrome.storage.sync.set({
      primaryLanguage: primaryLanguage,
      secondaryLanguage: secondaryLanguage
    }, function() {
      console.log('Settings saved');
      // Notify content script to update subtitles
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSubtitles",
          primaryLanguage: primaryLanguage,
          secondaryLanguage: secondaryLanguage
        });
      });
    });
  });

  // Load saved settings
  chrome.storage.sync.get(['primaryLanguage', 'secondaryLanguage'], function(result) {
    if (result.primaryLanguage) {
      language1Select.value = result.primaryLanguage;
    }
    if (result.secondaryLanguage) {
      language2Select.value = result.secondaryLanguage;
    }
  });
});
