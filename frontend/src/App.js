import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
}));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [audioOnly, setAudioOnly] = useState(false);
  const [timeRange, setTimeRange] = useState([0, 0]);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
      setTimeRange([0, response.data.duration]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        url,
        itag: selectedFormat,
        audioOnly: audioOnly,
        startTime: timeRange[0],
        endTime: timeRange[1]
      });

      window.location.href = `${API_URL}/api/download?${params.toString()}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate download');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          YTD - YouTube Downloader
        </Typography>
        
        <StyledPaper elevation={3}>
          <form onSubmit={handleUrlSubmit}>
            <TextField
              fullWidth
              label="YouTube URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Video Info'}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {videoInfo && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                {videoInfo.title}
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  label="Quality"
                >
                  {videoInfo.formats.map((format) => (
                    <MenuItem key={format.itag} value={format.itag}>
                      {format.quality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={audioOnly}
                    onChange={(e) => setAudioOnly(e.target.checked)}
                  />
                }
                label="Audio Only"
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Time Range: {formatTime(timeRange[0])} - {formatTime(timeRange[1])}
                </Typography>
                <Slider
                  value={timeRange}
                  onChange={(_, newValue) => setTimeRange(newValue)}
                  max={videoInfo.duration}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatTime(value)}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleDownload}
                disabled={loading || !selectedFormat}
              >
                {loading ? <CircularProgress size={24} /> : 'Download'}
              </Button>
            </Box>
          )}
        </StyledPaper>
      </Box>
    </Container>
  );
}

export default App;
