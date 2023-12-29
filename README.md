# Spotify Canvas Fetcher WEBUI

This project is a tool for fetching all canvas videos from an artist on Spotify, based on their name.

I use a lot of code from https://github.com/bartleyg/my-spotify-canvas/tree/master to get the canvas videos, but I wanted to be able to fetch all the videos for an artist, not just the currently playing song.

This is the webui implementation of my other project https://github.com/AlbinHolmlund/spotify-canvas-fetcher, which allows you to search for an artist and fetch all the canvas videos for that artist.

That tool is a terminal application, while this is a web application. So it might be easier to use for some people.

This webui implementation is available at https://canvas.skrap.info

## Installation

Clone this github repo and install the dependencies using npm or yarn:

```sh
npm install
# or yarn
yarn install
```

## Usage

Start the web server, which serves both the api and the client (built with create-react-app):

```sh
npm run serve
```

## Development

If you want to develop the client, you can run:

``` 
npm start
```

This will run the server, as well as run `npm start` in the client folder, which will start the react development server. The development server will proxy all requests to the server api port.

## Deployment

To deploy the application, you can run:

```sh
npm run build
```

and then for example serve it with pm2:
    
```sh
pm2 start pm2-settings.json
```

which will start the server on port 8020.

## License

This project is licensed under the [MIT License](LICENSE).