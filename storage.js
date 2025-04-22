const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR, OUTPUT_DIR } = require('./config');

// Ensure upload and output directories exist
function setupDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created upload directory at ${UPLOAD_DIR}`);
  }
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory at ${OUTPUT_DIR}`);
  }
}

// Clean up old files
function cleanupOldFiles(directory, maxAgeHours = 24) {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}:`, err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for ${filePath}:`, err);
          return;
        }
        
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting old file ${filePath}:`, err);
            } else {
              console.log(`Deleted old file: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

module.exports = {
  setupDirectories,
  cleanupOldFiles
};