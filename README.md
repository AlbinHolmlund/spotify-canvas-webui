# Spotify Canvas Fetcher WEBUI

This project is a tool for fetching all canvas videos from an artist on Spotify, based on their name.

I use a lot of code from https://github.com/bartleyg/my-spotify-canvas/tree/master to get the canvas videos, but I wanted to be able to fetch all the videos for an artist, not just the currently playing song.

This is the webui implementation of my other project https://github.com/AlbinHolmlund/spotify-canvas-fetcher, which allows you to search for an artist and fetch all the canvas videos for that artist.

That tool is a terminal application, while this is a web application. So it might be easier to use for some people.

This webui implementation is available at https://canvas.skrap.info

## Installation

Clone this github repo and install the dependencies of the server and the client folder using npm or yarn:

```sh
npm install && cd client && npm install && cd ..
# or yarn
yarn && cd client && yarn && cd ..
```

## Configuration

Before running the application, you need to set up your Spotify API credentials. Follow these steps:

1. Copy the `.env-example` file and rename it to `.env`:

```sh
cp .env-example .env
```

2. Open the `.env` file and replace the placeholders with your actual Spotify API credentials:

```text
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
```

Replace `<your-spotify-client-id>` and `<your-spotify-client-secret>` with your actual Spotify client ID and secret.

> To get your Spotify API credentials, you need to create a Spotify developer account and create a new application. You can do this by following the instructions on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).

1. Save the `.env` file. The application will now have access to these environment variables.

## Usage

Start the web server, which serves both the api and the client (built with create-react-app):

```sh
npm run serve
# or yarn
yarn serve
```

## Development

If you want to develop the client, you can run:

``` 
npm start
# or yarn
yarn start
```

This will run the server, as well as run `npm start` in the client folder, which will start the react development server. The development server will proxy all requests to the server api port.

## Deployment

To deploy the application, you can run:

```sh
npm run build
# or yarn
yarn build
```

and then for example serve it with pm2:
    
```sh
pm2 start pm2-settings.json
```

which will start the server on port 8020.

## License

This project is licensed under the [MIT License](LICENSE).