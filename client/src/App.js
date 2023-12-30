import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import JSZip from 'jszip';
import './App.scss';

async function downloadVideosAsZip(cbProgress, cbDone) {
	const zip = new JSZip();
	const videoLinks = document.querySelectorAll('a[download]');
	const videos = [];

	// Loop through all links and get the video src
	console.log(videoLinks);
	for (let videoLink of videoLinks) {
		videos.push({ src: videoLink.href, name: videoLink.download });
	}

	// Loop through all videos and add them to the zip
	for (let [index, video] of videos.entries()) {
		const videoBlob = await fetch(video.src).then(r => r.blob());
		// Trigger progress 
		cbProgress(index, videos.length, video.name);
		await zip.file(video.name, videoBlob, { binary: true });
	}

	// Generate zip and trigger download
	return zip.generateAsync({ type: 'blob' }).then(function (content) {
		cbDone();
		const url = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'videos.zip';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
}


const PlaceholderPhoto = styled.div`
	background-color: #ccc;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #000;
	font-size: 1.5em;
	text-align: center;
	margin: 0 auto;
	font-family: Arial, sans-serif;
	width: 100%;
	height: 100%;
	position: absolute;
	top: 10px;
	left: 10px;
	right: 10px;
	bottom: 10px;
	width: calc(100% - 20px);
	height: calc(100% - 20px);
`;

const PlaceholderContainer = styled.div`
	width: 100%;
	min-width: 200px;
	padding-bottom: ${(16 / 9) * 100}%;
	margin: 0 auto;
	position: relative;
`;

const VideoWrapper = styled.div`
	font-size: 1.5em;
	width: 100%;
	min-width: 200px;
	padding-bottom: ${(16 / 9) * 100}%;
	position: relative;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	video{
		position: absolute;
		top: 10px;
		left: 10px;
		right: 10px;
		bottom: 10px;
		width: calc(100% - 20px);
		height: calc(100% - 20px);
		object-fit: cover;
	}
`;

const Video = ({ ...props }) => {
	return (
		<VideoWrapper>
			<video {...props} />
		</VideoWrapper>
	);
}

const CanvasPlaceholder = () => {
	return (
		<PlaceholderContainer>
			<PlaceholderPhoto>
				No canvas<br />available
			</PlaceholderPhoto>
		</PlaceholderContainer>
	);
}

const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	width: 90%;
`;

const Item = styled.div`
	min-width: 25%;

	p{
		margin: 0;
		font-weight: bold;
	}
`;

const Note = styled.p`
	width: 100%;
	max-width: 500px;
	margin: 0 auto;
	padding: 0 10px;
	margin-bottom: 20px;
`;

const tryToParse = (value) => {
	try {
		return typeof value === 'string' && (value.indexOf('{') === 0 || value.indexOf('[') === 0) ? JSON.parse(value) : value;
	} catch (error) {
		return value;
	}
}

const tryToStringify = (value) => {
	try {
		if (typeof value === 'object' && value !== null) {
			return JSON.stringify(value);
		} else {
			return value;
		}
	} catch (error) {
		return value;
	}
}

const useLocalStorage = (key, initialValue) => {
	const [storedValue, setStoredValue] = useState(() => {
		const item = window.localStorage.getItem(key);
		return item ? tryToParse(item) : initialValue;
	});
	const setValue = value => {
		let stringifiedValue = tryToStringify(value);
		window.localStorage.setItem(key, stringifiedValue);
		setStoredValue(value);
	}
	return [storedValue, setValue];
}

function App() {
	const [value, setValue] = useState('');
	const refValue = React.useRef(value);
	const [results, setResults] = useState([]);
	const [requesting, setRequesting] = useState(false);
	const [status, setStatus] = useState('idle');
	const handleRequest = (value) => {
		// Value is an artist name
		setRequesting(true);

		window.location.hash = value;
		refValue.current = value;

		axios.get(`/api/${value}`).then(({ data }) => {
			/*
				Response is: 
				[
					{
						canvasUrl: 'https://...',
						artistName: '...',
						trackName: '...',
					}
				]
			*/
			console.log(data);
			setResults(data);
			setRequesting(false);
		});
	}

	useEffect(() => {
		if (window.location.hash) {
			let hash = window.location.hash.replace('#', '');
			// Url decode the hash
			hash = decodeURIComponent(hash);
			setValue(hash);
			handleRequest(hash);
		}
		// Event listener for hash change
		window.addEventListener('hashchange', () => {
			if (window.location.hash !== `#${refValue.current}`) {
				let hash = window.location.hash.replace('#', '');
				// Url decode the hash
				hash = decodeURIComponent(hash);
				setValue(hash);
				handleRequest(hash);
			}
		});
	}, []);

	useEffect(() => {
		// When the dom is ready, focus play a very short amount of the videos to make them show the first frame, do this for all videos in sequence

		setTimeout(() => {
			const videos = document.querySelectorAll('video');
			let i = 0;
			// Loop through videos in sequence (async) and play them for 0.1 seconds, also wait for canplay event before going to the next video
			const playNext = () => {
				if (i < videos.length) {
					const video = videos[i];
					(function (video) {
						video.play();
						video.addEventListener('canplay', () => {
							setTimeout(() => {
								video.pause();
								i++;
								playNext();
							}, 100);
						});
					})(video);
				}
			}
			playNext();
		}, 400);
	}, [requesting]);

	let downloadAllDisabled = results.filter((result) => result.canvasUrl).length === 0;

	if (status !== 'idle') {
		downloadAllDisabled = true;
	}

	return (
		<div className="App">
			<h1>Spotify Canvas Fetcher <span>WEBUI</span></h1>
			<Note>
				Note: Atm it caches the results for 1 hour, so if you search for an artist and then search for the same artist again within 1 hour, it will return the cached results.
			</Note>
			<Note>
				<strong>Disclaimer! If Spotify doesn't like this, I will take it down. I'm not responsible for anything that you do with this tool. It is meant to be used for artists to get their own canvases. </strong>
			</Note>
			{requesting ? (
				<p>Loading...</p>
			) : (
				<>
					<div class="container text-center" style={{
						margin: '20px auto',
						maxWidth: '500px',
						width: '100%',
					}}>
						<div class="row">
							<div class="col-10 mx-auto">
								<form onSubmit={(e) => {
									e.preventDefault();
									handleRequest(value);
								}}>
									<div class="input-group">
										<input type="text" class="form-control" placeholder="Search..." autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
										<div class="input-group-append">
											<button class="btn btn-primary" type="submit"><span>Search</span> <i class="fa fa-search"></i></button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div>
						{status === 'idle' && (
							<button
								class="btn btn-primary"
								onClick={(e) => {
									e.preventDefault();
									setStatus('Downloading...');
									downloadVideosAsZip((index, total, name) => {
										setStatus(`Downloading ${index + 1}/${total} (${name})`);
									}, () => {
										setStatus('idle');
									});
								}}
								disabled={downloadAllDisabled}
							>
								Download all as zip
							</button>
						)}
						{status !== 'idle' && (
							<p>{status}</p>
						)}
					</div>
					<Container>
						{results.filter((result) => result.canvasUrl).length === 0 && (
							<p style={{ margin: '0 auto' }}>No results</p>
						)}
						{results.filter((result) => result.canvasUrl).map((result) => (
							<Item>
								<p>{result.artists.map((artist) => artist.name).join(', ')}</p>
								<p>{result.name}</p>
								<a target="_blank" rel="noopener noreferrer" href={result.canvasUrl} download={`${result.artists.map((artist) => artist.name).join(', ')} - ${result.name}.mp4`} class="btn btn-primary" onClick={(e) => {
									fetch(result.canvasUrl)
										.then(response => response.blob())
										.then(blob => {
											// Create a new URL for the blob
											const blobUrl = URL.createObjectURL(blob);

											// Create a link and set the URL and download attribute
											const link = document.createElement('a');
											link.href = blobUrl;
											link.download = `${result.artists.map((artist) => artist.name).join(', ')} - ${result.name}.mp4`;

											// Append the link to the document and trigger a click
											document.body.appendChild(link);
											link.click();

											// Clean up by removing the link and revoking the blob URL
											document.body.removeChild(link);
											URL.revokeObjectURL(blobUrl);
										});
									e.preventDefault();
								}}>Download</a>
								{result.canvasUrl ? (
									<Video src={result.canvasUrl} controls loop muted playsInline />
								) : (
									<CanvasPlaceholder />
								)}
							</Item>
						))}
					</Container>
				</>
			)}
		</div>
	);
}

export default App;
