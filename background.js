console.log(`Background script is running - ${new Date().toISOString()}`);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery == "injectScript") {
    console.log('Injecting script into tab ' + sender.tab.id);
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      function: injectScriptContent,
    });
  }
});

function injectScriptContent() {
  const head = document.head;
  console.log(head);

  const injectedFunction = () => {
    console.log('Injected script is running!');
    // Your code here
    // For example:
    alert('Script injected successfully!');
  }

  const script = document.createElement('script');
  script.innerHTML = '(' + injectedFunction.toString() + ')()';
  console.log(script);
  document.head.appendChild(script);
}
