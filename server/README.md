# harrytv server

The server for HarryTV.

# Environment variables

If you want to update data from 3rd party servers you need to pass through the api keys as an environment variable.

`TRAKT_API_KEY=value FANART_API_KEY=value npm start`

Alternatively create a `config.local.js` file after duplicating `config.js` and put in the values there.

# API Keys

API Keys from:
* [Trakt.tv](https://trakt.tv/)
* [Fanart.tv](https://fanart.tv/get-an-api-key/) for images.
