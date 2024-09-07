// send message to background.js
chrome.runtime.sendMessage({ contentScriptQuery: "injectScript" });


// Listen for the getSettings event from the injected script
window.addEventListener('getSettings', function () {
  chrome.runtime.sendMessage({ action: "getSettings" }, function (response) {
    window.dispatchEvent(new CustomEvent('settingsReceived', { detail: response.settings }));
  });
});
