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
  origin: ['https://generous-presence.up.railway.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.get('/api/info', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const info = await ytdl.getInfo(url);
        const formats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel,
                mimeType: format.mimeType,
                contentLength: format.contentLength
            }));

        res.json({
            title: info.videoDetails.title,
            formats,
            duration: info.videoDetails.lengthSeconds
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/download', async (req, res) => {
    try {
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
        res.status(500).json({ error: error.message });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 