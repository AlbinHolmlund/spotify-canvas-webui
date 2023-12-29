const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const { getCanvasUrls } = require('./main.js');

// In-memory cache for storing results
let cache = {};

// File path for storing cache data
const cacheFilePath = path.join(__dirname, 'cache.json');

// Serve static files from the client/build directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Load cache data from file on server startup
if (fs.existsSync(cacheFilePath)) {
    const cacheData = fs.readFileSync(cacheFilePath, 'utf8');
    if (cacheData) {
        try {
            cache = JSON.parse(cacheData);
        } catch (error) {
            console.error('Error parsing cache data:', error);
        }
    }
}

// Save cache data to file
function saveCacheToFile() {
    fs.writeFile(cacheFilePath, JSON.stringify(cache), 'utf8', (error) => {
        if (error) {
            console.error('Error saving cache data to file:', error);
        }
    });
}

// Middleware to check cache expiration
function checkCacheExpiration(req, res, next) {
    const artistName = req.params.name.toLowerCase(); // Normalize artist name to lowercase
    if (cache[artistName] && cache[artistName].timestamp) {
        const currentTime = new Date().getTime();
        const cacheExpirationTime = cache[artistName].timestamp + 3600000; // 1 hour in milliseconds
        if (currentTime < cacheExpirationTime) {
            // Cache is still valid, return the cached data
            res.json(cache[artistName].data);
            return;
        }
    }
    next();
}

app.get('/api/:name', checkCacheExpiration, async (req, res) => {
    const artistName = req.params.name.toLowerCase(); // Normalize artist name to lowercase
    try {
        const canvasUrls = await getCanvasUrls(artistName);
        console.log('Found canvas urls:', canvasUrls.length);
        cache[artistName] = {
            timestamp: new Date().getTime(),
            data: canvasUrls
        };
        saveCacheToFile(); // Save cache data to file
        res.json(canvasUrls);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const port = process.env.PORT || 8020;
app.listen(port, () => console.log(`Server is running on port ${port}`));