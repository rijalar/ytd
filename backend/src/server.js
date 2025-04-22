const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: ['https://ytd-production-66d8.up.railway.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.get('/api/info', async (req, res) => {
    try {
        console.log('Video info requested with URL:', req.query.url);
        
        if (!req.query.url) {
            console.log('No URL provided in request');
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(req.query.url)) {
            console.log('Invalid YouTube URL:', req.query.url);
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        console.log('Fetching video info...');
        const info = await ytdl.getInfo(req.query.url);
        console.log('Video title:', info.videoDetails.title);

        const formats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel,
                mimeType: format.mimeType,
                contentLength: format.contentLength
            }));

        console.log('Available formats:', formats.length);
        
        res.json({
            title: info.videoDetails.title,
            formats,
            duration: info.videoDetails.lengthSeconds
        });
    } catch (error) {
        console.error('Detailed error in /api/info:', {
            message: error.message,
            stack: error.stack,
            url: req.query.url
        });
        res.status(500).json({ 
            error: 'Failed to fetch video information',
            details: error.message 
        });
    }
});

app.get('/api/download', async (req, res) => {
    try {
        console.log('Download requested:', req.query);
        const { url, itag, startTime, endTime, audioOnly } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });
        
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        
        if (audioOnly) {
            // Audio download logic
            const audioStream = ytdl(url, { quality: 'highestaudio' });
            ffmpeg(audioStream)
                .toFormat('mp3')
                .pipe(res);
        } else if (startTime && endTime) {
            // Partial video download
            const videoStream = ytdl(url, { quality: itag });
            ffmpeg(videoStream)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .toFormat('mp4')
                .pipe(res);
        } else {
            // Full video download
            ytdl(url, { quality: itag }).pipe(res);
        }
    } catch (error) {
        console.error('Error in /api/download:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    console.log('Serving React app for path:', req.path);
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 