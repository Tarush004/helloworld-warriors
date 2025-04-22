const Job = require('../models/Job');
const { processAudio } = require('../services/audioService');
const { generateLyricsFromAudio } = require('../services/lyricService');
const { generateVideoWithLyrics } = require('../services/videoService');
const { addToQueue } = require('../services/queueService');
const path = require('path');
const fs = require('fs');
const { OUTPUT_DIR } = require('../config/config');

// Upload audio file
exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const job = new Job({
      userId: req.user?.id || 'anonymous',
      originalFilename: req.file.originalname,
      audioPath: req.file.path,
      status: 'uploaded'
    });

    await job.save();

    res.status(201).json({ 
      success: true, 
      message: 'Audio uploaded successfully', 
      jobId: job._id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading audio', 
      error: error.message 
    });
  }
};

// Generate lyrics from audio
exports.generateLyrics = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.status = 'processing_lyrics';
    await job.save();

    // Add to processing queue
    await addToQueue('lyrics-generation', { jobId: job._id });

    res.status(200).json({ 
      success: true, 
      message: 'Lyrics generation started', 
      jobId: job._id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error starting lyrics generation', 
      error: error.message 
    });
  }
};

// Sync lyrics with audio
exports.syncLyrics = async (req, res) => {
  try {
    const { jobId, lyrics } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.lyrics = lyrics;
    job.status = 'syncing_lyrics';
    await job.save();

    // Add to processing queue
    await addToQueue('lyrics-syncing', { jobId: job._id });

    res.status(200).json({ 
      success: true, 
      message: 'Lyrics syncing started', 
      jobId: job._id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error starting lyrics syncing', 
      error: error.message 
    });
  }
};

// Generate video with synced lyrics
exports.generateVideo = async (req, res) => {
  try {
    const { jobId, theme } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.theme = theme;
    job.status = 'generating_video';
    await job.save();

    // Add to processing queue
    await addToQueue('video-generation', { jobId: job._id });

    res.status(200).json({ 
      success: true, 
      message: 'Video generation started', 
      jobId: job._id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error starting video generation', 
      error: error.message 
    });
  }
};

// Get job status
exports.getJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ 
      success: true, 
      job: {
        id: job._id,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error getting job status', 
      error: error.message 
    });
  }
};

// Download generated video
exports.downloadVideo = async (req, res) => {
  try {
    const filePath = path.join(OUTPUT_DIR, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Error downloading file' 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading video', 
      error: error.message 
    });
  }
};