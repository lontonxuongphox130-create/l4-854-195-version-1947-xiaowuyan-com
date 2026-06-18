function initMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.querySelector('[data-player-overlay="' + videoId + '"]');
  var button = document.querySelector('[data-player-button="' + videoId + '"]');
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function attachStream() {
    if (video.dataset.ready === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    video.dataset.ready = '1';
  }

  function startPlayback() {
    attachStream();
    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
