const ffmpeg = require('fluent-ffmpeg');
const { AUDD_API_KEY } = require('../config/config');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Process audio file (convert to standard format)
exports.processAudio = async (filePath) => {
  const outputPath = filePath.replace(path.extname(filePath), '.processed.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .audioCodec('libmp3lame')
      .audioBitrate(192)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

// Extract audio features
exports.extractAudioFeatures = async (filePath) => {
  // In a real app, you would use a library like Essentia.js or an API
  // This is a simplified version
  return {
    duration: await getAudioDuration(filePath),
    sampleRate: 44100, // Placeholder
    channels: 2, // Placeholder
    // Add more features as needed
  };
};

// Get audio duration
async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

// Recognize audio using AudD API
exports.recognizeAudio = async (filePath) => {
  if (!AUDD_API_KEY) {
    throw new Error('AUDD_API_KEY not configured');
  }

  const fileData = fs.readFileSync(filePath);
  const base64Data = fileData.toString('base64');

  const response = await axios.post('https://api.audd.io/', {
    api_token: AUDD_API_KEY,
    audio: base64Data,
    return: 'timecode,lyrics'
  });

  return response.data;
};