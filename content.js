console.log('Netflix Dual Language Subtitles content script loaded');

chrome.runtime.sendMessage({ contentScriptQuery: "injectScript" });
