(function () {
    function startPlayer() {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('play-overlay');
        var source = window.MOVIE_SOURCE || '';
        var attached = false;

        if (!video || !button || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', play);
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
    }

    if (document.readyState !== 'loading') {
        startPlayer();
    } else {
        document.addEventListener('DOMContentLoaded', startPlayer);
    }
})();
