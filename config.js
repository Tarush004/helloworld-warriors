require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lyric-video-generator',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  AUDD_API_KEY: process.env.AUDD_API_KEY,
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg',
  FFPROBE_PATH: process.env.FFPROBE_PATH || 'ffprobe',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
  OUTPUT_DIR: process.env.OUTPUT_DIR || path.join(__dirname, '../outputs'),
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024, // 50MB
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d'
};