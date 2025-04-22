const { recognizeAudio } = require('/audioService');
const { generateSRT } = require('../utils/srtGenerator');
const path = require('path');
const fs = require('fs');

// Generate lyrics from audio file
exports.generateLyricsFromAudio = async (jobId, audioPath) => {
  try {
    // Use AudD API to recognize audio and get lyrics
    const recognitionResult = await recognizeAudio(audioPath);
    
    if (!recognitionResult || !recognitionResult.lyrics) {
      throw new Error('Could not generate lyrics from audio');
    }

    return {
      rawLyrics: recognitionResult.lyrics,
      timedLyrics: recognitionResult.timecode
    };
  } catch (error) {
    console.error(`Error generating lyrics for job ${jobId}:`, error);
    throw error;
  }
};

// Sync lyrics with audio (manual or automatic)
exports.syncLyricsWithAudio = async (jobId, audioPath, lyrics, options = {}) => {
  try {
    // In a real app, this would use speech recognition to time the lyrics
    // For demo, we'll simulate it with simple timing
    
    const words = lyrics.split(/\s+/);
    const duration = await getAudioDuration(audioPath);
    const wordDuration = duration / words.length;
    
    const timedWords = words.map((word, index) => ({
      word,
      start: index * wordDuration,
      end: (index + 1) * wordDuration
    }));
    
    // Generate SRT file
    const srtContent = generateSRT(timedWords);
    const srtPath = path.join(path.dirname(audioPath), `${jobId}.srt`);
    fs.writeFileSync(srtPath, srtContent);
    
    return {
      srtPath,
      timedLyrics: timedWords
    };
  } catch (error) {
    console.error(`Error syncing lyrics for job ${jobId}:`, error);
    throw error;
  }
};

// Helper function to get audio duration
async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}