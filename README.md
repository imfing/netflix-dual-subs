# Netflix Dual Language Subtitles

A Chrome extension that adds support for dual language subtitles on Netflix.

## Features

- Display subtitles in a preferred language alongside Netflix's default subtitles
- Support for multiple languages including English, Japanese, Chinese (Simplified and Traditional), Spanish, and French
- Easy-to-use popup interface for language selection
- Automatic subtitle fetching and parsing

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

1. Click the extension icon in Chrome to open the popup
2. Select your preferred subtitle language
3. Click "Save Settings"
4. Reload your Netflix page for the changes to take effect

## Files

- `background.js`: Handles background processes and message passing
- `content.js`: Injects scripts into Netflix pages
- `popup.html` & `popup.js`: Manage the extension's user interface
- `scripts/inject.js`: Fetches and stores subtitle data
- `scripts/subtitle.js`: Parses and displays subtitles
- `styles.css`: Styles the popup interface

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)