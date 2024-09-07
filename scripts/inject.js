function getSubtitles(id, data) {
  const format = "imsc1.1"

  data = data.filter(item => item.ttDownloadables && Object.keys(item.ttDownloadables).length > 0);

  for (const item of data) {
    const language = item.language
    const description = item.languageDescription

    const downloadables = item.ttDownloadables;
    if (!downloadables || !downloadables[format]?.urls?.length) continue;

    const url = downloadables[format].urls[0].url;

    // fetch the subtitle file and store it in local storage with CORS handling
    fetch(url, { mode: 'cors' })
      .then(response => {
        if (!response.ok) throw new Error('failed to fetch subtitle from ' + url);
        return response.text();
      })
      .then(text => {
        localStorage.setItem(`subtitles-${id}-${language}`, text);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
}

const injection = () => {
  console.log('The injected script has successfully started executing within the context of the web page!');

  // Override parsing JSON
  ((parse) => {
    JSON.parse = function (text) {
      const data = parse(text)
      if (data && data.result && data.result.timedtexttracks) {
        const movieId = data.result.movieId
        getSubtitles(movieId, data.result.timedtexttracks)
      }
      return data
    };
  })(JSON.parse);
}

function injectScriptContent() {
  const script = document.createElement('script');
  script.innerHTML = '(' + injection.toString() + ')()';
  document.head.appendChild(script);
}

injectScriptContent();
