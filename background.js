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
    console.log('The injected script has successfully started executing within the context of the web page!');
    ((parse, stringify) => {
      JSON.parse = function (text) {
        const data = parse(text)
        if (data && data.result && data.result.timedtexttracks) {
          console.log(data.result)
        }
        return data
      };
      JSON.stringify = stringify
    })(JSON.parse, JSON.stringify);
  }

  const script = document.createElement('script');
  script.innerHTML = '(' + injectedFunction.toString() + ')()';
  document.head.appendChild(script);
}
