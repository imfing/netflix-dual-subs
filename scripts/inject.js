function storeMovieInfo(id, languages) {
  localStorage.setItem('currentMovieId', id);
  localStorage.setItem('availableLanguages', JSON.stringify(languages));
}

function cleanupSubtitles(newMovieId) {
  const currentMovieId = localStorage.getItem('currentMovieId');
  if (newMovieId !== currentMovieId) {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('subtitle') || key === 'availableLanguages') {
        localStorage.removeItem(key);
      }
    });
  }
}

function getSubtitles(id, data) {
  cleanupSubtitles(id);

  const availableLanguages = JSON.parse(localStorage.getItem('availableLanguages') || '[]');

  const format = "imsc1.1"
  const languages = [];

  data = data.filter(item => item.ttDownloadables && Object.keys(item.ttDownloadables).length > 0);

  for (const item of data) {
    const language = item.language
    const description = item.languageDescription

    // Check if subtitles for the specific language already exist for the current movie ID
    if (id === localStorage.getItem('currentMovieId') && availableLanguages.includes(language)) {
      console.debug(`Subtitles for this movie in language ${language} already exist. Skipping fetch.`);
      return;
    }

    const downloadables = item.ttDownloadables;
    if (!downloadables || !downloadables[format]?.urls?.length) continue;

    languages.push({ id: language, description });
    const url = downloadables[format].urls[0].url;

    // fetch the subtitle file and store it in local storage with CORS handling
    fetch(url, { mode: 'cors' })
      .then(response => {
        if (!response.ok) throw new Error('failed to fetch subtitle from ' + url);
        return response.text();
      })
      .then(text => {
        localStorage.setItem(`subtitle-${language}`, text);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  storeMovieInfo(id, languages);
}

const injection = () => {
  console.debug('The injected script has successfully started executing within the context of the web page!');

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
