// send message to background.js
chrome.runtime.sendMessage({ contentScriptQuery: "injectScript" });
