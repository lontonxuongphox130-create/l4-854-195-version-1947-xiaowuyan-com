(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = form.getAttribute('action') || './search.html';
                window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
            });
        });
    }

    function initLocalFilter() {
        var list = document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        var searchInput = document.querySelector('[data-local-search]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var empty = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }
        function apply() {
            var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value.trim() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchText = !term || haystack.indexOf(term) !== -1;
                var matchType = !type || cardType.indexOf(type) !== -1;
                var show = matchText && matchType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }
        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        apply();
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var src = player.getAttribute('data-src');
            var hasStarted = false;
            function writeMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }
            function start() {
                if (!video || !src) {
                    writeMessage('播放暂时不可用，请稍后再试。');
                    return;
                }
                if (!hasStarted) {
                    hasStarted = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.ERROR, function () {
                            writeMessage('播放连接中，请稍后重试。');
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else {
                        video.src = src;
                    }
                }
                video.controls = true;
                video.play().then(function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                    writeMessage('');
                }).catch(function () {
                    writeMessage('点击播放器即可继续播放。');
                });
            }
            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('click', start);
            }
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initLocalFilter();
        initHero();
        initPlayers();
    });
})();
