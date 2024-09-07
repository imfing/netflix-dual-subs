document.addEventListener('DOMContentLoaded', function () {
  const saveButton = document.getElementById('saveButton');
  const preferredLanguageSelect = document.getElementById('preferredLanguage');

  saveButton.addEventListener('click', function () {
    const preferredLanguage = preferredLanguageSelect.value;

    chrome.storage.local.set({
      preferredLanguage: preferredLanguage
    }, function () {
      window.close();
    });
  });

  // Load saved settings
  chrome.storage.local.get(['preferredLanguage'], function (result) {
    if (result.preferredLanguage) {
      preferredLanguageSelect.value = result.preferredLanguage;
    }
  });
});
