# YTD - YouTube Video Downloader

A modern web application for downloading YouTube videos and audio with various features including:
- Multiple resolution downloads
- Audio-only downloads
- Partial video downloads using timestamps
- Clean and intuitive user interface

## Features
- Download videos in different resolutions
- Extract audio from videos
- Download specific sections of videos using timestamps
- Modern, responsive UI
- Real-time download progress tracking

## Tech Stack
- Frontend: React.js, Material-UI
- Backend: Node.js, Express
- Deployment: Railway

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

### Development
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

### Deployment
The application is configured for deployment on Railway. Follow these steps:
1. Push your code to a GitHub repository
2. Connect the repository to Railway
3. Configure environment variables
4. Deploy the application

## License
MIT 