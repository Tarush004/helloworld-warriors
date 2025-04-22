// Generate SRT file content from timed words
exports.generateSRT = (timedWords) => {
    let srtContent = '';
    let index = 1;
    
    for (const item of timedWords) {
      const startTime = formatTime(item.start);
      const endTime = formatTime(item.end);
      
      srtContent += `${index++}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${item.word}\n\n`;
    }
    
    return srtContent;
  };
  
  // Format time for SRT (HH:MM:SS,mmm)
  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const secs = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    
    return `${hours}:${minutes}:${secs},${ms}`;
  }