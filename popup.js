document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const preferredLanguageSelect = document.getElementById('preferredLanguage');

  saveButton.addEventListener('click', function() {
    const preferredLanguage = preferredLanguageSelect.value;

    chrome.storage.local.set({
      preferredLanguage: preferredLanguage
    }, function() {
      console.log('Settings saved');
      // Notify content script to update subtitles
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSubtitles",
          preferredLanguage: preferredLanguage
        }, function() {
          // Close the popup after sending the message
          window.close();
        });
      });
    });
  });

  // Load saved settings
  chrome.storage.local.get(['preferredLanguage'], function(result) {
    if (result.preferredLanguage) {
      preferredLanguageSelect.value = result.preferredLanguage;
    }
  });
});
