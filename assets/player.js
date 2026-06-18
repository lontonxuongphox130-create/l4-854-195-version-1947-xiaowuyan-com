(function () {
  function initVideoPlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }

    var box = video.closest('.player-box');
    var startButton = document.querySelector('[data-player-start="' + videoId + '"]');
    var errorBox = box ? box.querySelector('.player-error') : null;
    var hlsInstance = null;
    var sourceAttached = false;

    function showError() {
      if (box) {
        box.classList.add('has-error');
      }
      if (errorBox) {
        errorBox.textContent = '视频暂时无法播放，请稍后再试';
      }
    }

    function attachSource() {
      if (sourceAttached) {
        return;
      }
      sourceAttached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            showError();
          }
        });
        return;
      }

      showError();
    }

    function playVideo() {
      attachSource();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('click', toggleVideo);
    video.addEventListener('play', function () {
      if (box) {
        box.classList.add('is-playing');
      }
      video.setAttribute('controls', 'controls');
    });
    video.addEventListener('pause', function () {
      if (box) {
        box.classList.remove('is-playing');
      }
    });

    attachSource();
  }

  window.initVideoPlayer = initVideoPlayer;
})();
