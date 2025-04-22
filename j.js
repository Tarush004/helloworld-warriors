document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const uploadForm = document.getElementById('uploadForm');
  const audioFileInput = document.getElementById('audioFile');
  const lyricsInput = document.getElementById('lyricsInput');
  const themeSelect = document.getElementById('themeSelect');
  const autoSyncCheck = document.getElementById('autoSyncCheck');
  const generateBtn = document.getElementById('generateBtn');
  const previewArea = document.getElementById('previewArea');
  const videoContainer = document.getElementById('videoContainer');
  const generatedVideo = document.getElementById('generatedVideo');
  const downloadBtn = document.getElementById('downloadBtn');
  const newVideoBtn = document.getElementById('newVideoBtn');
  const progressContainer = document.getElementById('progressContainer');
  const generationProgress = document.getElementById('generationProgress');

  // Variables to track state
  let audioFile = null;
  let audioUrl = null;
  let videoUrl = null;

  // Event Listeners
  audioFileInput.addEventListener('change', handleAudioUpload);
  uploadForm.addEventListener('submit', handleFormSubmit);
  downloadBtn.addEventListener('click', downloadVideo);
  newVideoBtn.addEventListener('click', resetForm);

  // Functions
  function handleAudioUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      audioFile = file;
      
      // Create a preview URL for the audio
      if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
      }
      audioUrl = URL.createObjectURL(file);
      
      // If lyrics are empty, we could try to generate them here in a real app
      // For now, just update the UI
      previewArea.innerHTML = `
          <i class="fas fa-music fa-4x mb-3"></i>
          <h5>${file.name}</h5>
          <p>Ready to generate lyric video</p>
      `;
  }

  function handleFormSubmit(e) {
      e.preventDefault();
      
      if (!audioFile) {
          alert('Please upload an audio file first');
          return;
      }
      
      // Show progress
      videoContainer.classList.add('d-none');
      progressContainer.classList.remove('d-none');
      generateBtn.disabled = true;
      
      // Simulate video generation progress
      simulateVideoGeneration();
  }

  function simulateVideoGeneration() {
      let progress = 0;
      const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5;
          if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              finishVideoGeneration();
          }
          generationProgress.style.width = `${progress}%`;
          generationProgress.textContent = `${progress}%`;
      }, 500);
  }

  function finishVideoGeneration() {
      // In a real app, this would be the actual generated video URL
      // For demo purposes, we'll use a placeholder
      videoUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      
      // Set the video source
      generatedVideo.src = videoUrl;
      
      // Update UI
      progressContainer.classList.add('d-none');
      videoContainer.classList.remove('d-none');
      generateBtn.disabled = false;
      
      // Show success message
      previewArea.innerHTML = `
          <div class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              Lyric video generated successfully!
          </div>
      `;
  }

  function downloadVideo() {
      if (!videoUrl) return;
      
      // In a real app, this would trigger download of the actual generated video
      // For demo, we'll simulate it
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `lyric_video_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Show download confirmation
      const alert = document.createElement('div');
      alert.className = 'alert alert-info mt-3';
      alert.innerHTML = `
          <i class="fas fa-info-circle me-2"></i>
          Download started! In a real app, this would be your actual video.
      `;
      previewArea.appendChild(alert);
      
      setTimeout(() => {
          alert.remove();
      }, 3000);
  }

  function resetForm() {
      // Reset the form
      uploadForm.reset();
      
      // Clear previews
      if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          audioUrl = null;
      }
      audioFile = null;
      videoUrl = null;
      
      // Reset UI
      videoContainer.classList.add('d-none');
      progressContainer.classList.add('d-none');
      previewArea.innerHTML = `
          <i class="fas fa-music fa-4x mb-3"></i>
          <p>Your generated video will appear here</p>
      `;
  }

  // In a real application, you would have functions for:
  // - Analyzing audio and auto-generating lyrics (using a service like AudD or similar)
  // - Synchronizing lyrics with audio timings
  // - Generating video with lyrics and background visuals (using FFmpeg or similar)
  // - More robust error handling and user feedback
});