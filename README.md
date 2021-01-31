# MixBot

MixBot is a virtual DJ that will select and mix songs for you.

MixBot uses the Spotify API, YouTube API, and ytdl to find and play songs for you on two separate decks. 

MixBot is written in JavaScript/React with Express.js/NodeJS for the backend

Shoutout to https://www.algoriddim.com/ and their application "Djay" for being the inspiration for this project

## Usage

I'm currently working on creating a production build for Mac and Windows using Electron, which will be available soon

**Disclaimer:** To run MixBot in your browser, you need to download the "Allow CORS: Access-Control-Allow-Origin" plugin for Firefox/Chrome to get around the CORS errors that come with doing API calls from localhost. 

→ To run MixBot:

1. Clone the repo and install the necessary packages using `yarn install`
2. Run `node server.js` to turn on the Express server
3. Turn on your Allow CORS plugin for Firefox/Chrome
4. Run `yarn run` to run the project

From there, just select a mix from the three options and MixBot will take care of the rest! Enjoy :)
