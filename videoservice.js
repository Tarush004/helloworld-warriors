const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { OUTPUT_DIR } = require('../config/config');

// Generate video with lyrics
exports.generateVideoWithLyrics = async (jobId, audioPath, srtPath, theme = 'default') => {
  const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);
  
  // Get background based on theme
  const background = getBackgroundForTheme(theme);
  
  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(background)
      .input(audioPath)
      .complexFilter([
        // Scale background to 1080p
        {
          filter: 'scale',
          options: 'w=1920:h=1080:force_original_aspect_ratio=1',
          inputs: '[0:v]',
          outputs: 'bg'
        },
        // Pad if necessary
        {
          filter: 'pad',
          options: 'width=1920:height=1080:x=(ow-iw)/2:y=(oh-ih)/2:color=black',
          inputs: 'bg',
          outputs: 'padded'
        },
        // Add subtitles
        {
          filter: 'subtitles',
          options: `filename='${srtPath.replace(/\\/g, '\\\\')}':force_style='Fontname=Arial,Fontsize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=1,Shadow=0,MarginV=20'`,
          inputs: 'padded',
          outputs: 'withSubtitles'
        }
      ])
      .outputOptions([
        '-map [withSubtitles]',
        '-map 1:a',
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        '-c:a aac',
        '-b:a 192k',
        '-shortest'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
        // Update job progress in database
      })
      .on('end', () => {
        console.log('Video processing finished');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error processing video:', err);
        reject(err);
      });
    
    command.run();
  });
};

// Get background video/image based on theme
function getBackgroundForTheme(theme) {
  const themeAssets = {
    default: path.join(__dirname, '../assets/backgrounds/default.mp4'),
    pop: path.join(__dirname, '../assets/backgrounds/pop.mp4'),
    rock: path.join(__dirname, '../assets/backgrounds/rock.mp4'),
    hiphop: path.join(__dirname, '../assets/backgrounds/hiphop.mp4'),
    electronic: path.join(__dirname, '../assets/backgrounds/electronic.mp4'),
    romantic: path.join(__dirname, '../assets/backgrounds/romantic.mp4'),
    party: path.join(__dirname, '../assets/backgrounds/party.mp4')
  };
  
  return themeAssets[theme] || themeAssets.default;
}