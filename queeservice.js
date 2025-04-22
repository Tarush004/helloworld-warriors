const Queue = require('bull');
const { REDIS_URL } = require('../config/config');
const Job = require('../models/Job');
const {
  generateLyricsFromAudio,
  syncLyricsWithAudio
} = require('./lyricService');
const { generateVideoWithLyrics } = require('/videoService');

// Create queues
const lyricsQueue = new Queue('lyrics-generation', REDIS_URL);
const syncQueue = new Queue('lyrics-syncing', REDIS_URL);
const videoQueue = new Queue('video-generation', REDIS_URL);

// Process lyrics generation jobs
lyricsQueue.process(async (job) => {
  const { jobId } = job.data;
  const dbJob = await Job.findById(jobId);
  
  try {
    dbJob.status = 'processing_lyrics';
    await dbJob.save();
    
    const result = await generateLyricsFromAudio(jobId, dbJob.audioPath);
    
    dbJob.lyrics = result.rawLyrics;
    dbJob.timedLyrics = result.timedLyrics;
    dbJob.status = 'lyrics_generated';
    dbJob.result = result;
    await dbJob.save();
    
    return result;
  } catch (error) {
    dbJob.status = 'failed';
    dbJob.error = error.message;
    await dbJob.save();
    throw error;
  }
});

// Process lyrics syncing jobs
syncQueue.process(async (job) => {
  const { jobId } = job.data;
  const dbJob = await Job.findById(jobId);
  
  try {
    dbJob.status = 'syncing_lyrics';
    await dbJob.save();
    
    const result = await syncLyricsWithAudio(
      jobId, 
      dbJob.audioPath, 
      dbJob.lyrics
    );
    
    dbJob.srtPath = result.srtPath;
    dbJob.timedLyrics = result.timedLyrics;
    dbJob.status = 'lyrics_synced';
    dbJob.result = result;
    await dbJob.save();
    
    return result;
  } catch (error) {
    dbJob.status = 'failed';
    dbJob.error = error.message;
    await dbJob.save();
    throw error;
  }
});

// Process video generation jobs
videoQueue.process(async (job) => {
  const { jobId } = job.data;
  const dbJob = await Job.findById(jobId);
  
  try {
    dbJob.status = 'generating_video';
    await dbJob.save();
    
    const result = await generateVideoWithLyrics(
      jobId, 
      dbJob.audioPath, 
      dbJob.srtPath, 
      dbJob.theme
    );
    
    dbJob.videoPath = result;
    dbJob.status = 'completed';
    dbJob.result = { videoPath: result };
    await dbJob.save();
    
    return result;
  } catch (error) {
    dbJob.status = 'failed';
    dbJob.error = error.message;
    await dbJob.save();
    throw error;
  }
});

// Add job to queue
exports.addToQueue = async (queueName, data) => {
  switch (queueName) {
    case 'lyrics-generation':
      return lyricsQueue.add(data);
    case 'lyrics-syncing':
      return syncQueue.add(data);
    case 'video-generation':
      return videoQueue.add(data);
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
};