const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  audioPath: {
    type: String,
    required: true
  },
  lyrics: {
    type: String
  },
  timedLyrics: {
    type: mongoose.Schema.Types.Mixed
  },
  srtPath: {
    type: String
  },
  theme: {
    type: String,
    default: 'default'
  },
  videoPath: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'uploaded',
      'processing_lyrics',
      'lyrics_generated',
      'syncing_lyrics',
      'lyrics_synced',
      'generating_video',
      'completed',
      'failed'
    ],
    default: 'uploaded'
  },
  progress: {
    type: Number,
    default: 0
  },
  error: {
    type: String
  },
  result: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);