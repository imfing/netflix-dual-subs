console.debug(`Background script is running - ${new Date().toISOString()}`);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery == "injectScript") {
    console.debug('Injecting script into tab ' + sender.tab.id);
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      files: ['scripts/inject.js', 'scripts/subtitle.js'],
    });
  }
});
