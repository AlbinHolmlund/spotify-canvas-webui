import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import axios from 'axios';
import './App.scss';

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
	padding-bottom: ${(16/9)*100}%;
	margin: 0 auto;
	position: relative;
`;

const VideoWrapper = styled.div`
	font-size: 1.5em;
	width: 100%;
	min-width: 200px;
	padding-bottom: ${(16/9)*100}%;
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

const Video = ({...props}) => {
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
				No canvas<br/>available
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
		if (typeof value === 'object' && value !== null){
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
	const [value, setValue] = useLocalStorage('value', '');
	const [results, setResults] = useLocalStorage('results',[]);
	const [requesting, setRequesting] = useState(false);
	const handleRequest = (value) => {
		// Value is an artist name
		setRequesting(true);
		axios.get(`/api/${value}`).then(({data}) => {
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
		if (window.location.hash){
			let hash = window.location.hash.replace('#','');
			// Url decode the hash
			hash = decodeURIComponent(hash);
			setValue(hash);
			handleRequest(hash);
		}
	}, []);

	useEffect(() => {
		// Change hash when value changes
		window.location.hash = value;
	}, [value]);

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
					<Container>
						{results.filter((result) => result.canvasUrl).length === 0 && (
							<p style={{margin: '0 auto'}}>No results</p>
						)}
						{results.filter((result) => result.canvasUrl).map((result) => (
							<Item>
								<p>{result.artists.map((artist) => artist.name).join(', ')}</p>
								<p>{result.name}</p>
								{result.canvasUrl ? (
									<Video src={result.canvasUrl} controls />
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
