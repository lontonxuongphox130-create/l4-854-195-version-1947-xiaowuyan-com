(function () {
  window.launchMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var stream = options.stream;
    var hlsInstance = null;

    if (!video || !cover || !stream) {
      return;
    }

    function attachAndPlay() {
      cover.classList.add("is-hidden");
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = stream;
      video.play().catch(function () {});
    }

    cover.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(function () {});
      }
    });
  };
})();
