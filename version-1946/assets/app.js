(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSiteSearchForms();
    initHeroCarousel();
    initVideoPlayers();
    initSearchPage();
    initCardFilters();
  });

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initSiteSearchForms() {
    var forms = document.querySelectorAll('[data-site-search]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var action = form.getAttribute('action') || './search.html';

        if (query) {
          window.location.href = action + '?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initVideoPlayers() {
    var players = document.querySelectorAll('[data-video-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var source = player.getAttribute('data-video-src');
      var playButtons = player.querySelectorAll('[data-player-play]');
      var muteButton = player.querySelector('[data-player-mute]');
      var fullscreenButton = player.querySelector('[data-player-fullscreen]');
      var errorBox = player.querySelector('[data-player-error]');

      if (!video || !source) {
        return;
      }

      player.classList.add('is-paused');
      loadHlsSource(video, source, errorBox);

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              showPlayerError(errorBox, '浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          }
        } else {
          video.pause();
        }
      }

      playButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          togglePlay();
        });
      });

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        player.classList.remove('is-paused');
        playButtons.forEach(function (button) {
          button.textContent = 'Ⅱ';
        });
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
        player.classList.add('is-paused');
        playButtons.forEach(function (button) {
          button.textContent = '▶';
        });
      });

      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '🔇' : '🔊';
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
    });
  }

  function loadHlsSource(video, source, errorBox) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        hidePlayerError(errorBox);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          showPlayerError(errorBox, '网络错误，正在尝试重新加载视频。');
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          showPlayerError(errorBox, '媒体错误，正在尝试恢复播放。');
          hls.recoverMediaError();
          return;
        }

        showPlayerError(errorBox, '视频加载失败，请刷新页面后重试。');
        hls.destroy();
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      hidePlayerError(errorBox);
      return;
    }

    showPlayerError(errorBox, '当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Firefox 或 Safari。');
  }

  function showPlayerError(errorBox, message) {
    if (!errorBox) {
      return;
    }

    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
  }

  function hidePlayerError(errorBox) {
    if (!errorBox) {
      return;
    }

    errorBox.textContent = '';
    errorBox.classList.remove('is-visible');
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!input || !form || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearchResults(input.value.trim());
      var query = input.value.trim();
      var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', nextUrl);
    });

    renderSearchResults(initialQuery);

    function renderSearchResults(query) {
      var data = window.MOVIE_SEARCH_INDEX || [];
      var normalized = query.toLowerCase();
      var matches = data.filter(function (movie) {
        if (!normalized) {
          return true;
        }

        return movie.searchText.indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (count) {
        count.textContent = query ? '找到 ' + matches.length + ' 条相关结果' : '展示 ' + matches.length + ' 条推荐结果';
      }

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有找到相关影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<article class="movie-card">'
          + '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">'
          + '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
          + '<span class="poster-shade"></span>'
          + '<span class="play-float" aria-hidden="true">▶</span>'
          + '<span class="card-category">' + escapeHtml(movie.category) + '</span>'
          + '<span class="card-year">' + escapeHtml(movie.year) + '</span>'
          + '</a>'
          + '<div class="movie-card-body">'
          + '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>'
          + '<p>' + escapeHtml(movie.oneLine) + '</p>'
          + '</div>'
          + '</article>';
      }).join('');
    }
  }

  function initCardFilters() {
    var filterRoot = document.querySelector('[data-card-filter]');

    if (!filterRoot) {
      return;
    }

    var form = filterRoot.querySelector('form');
    var input = filterRoot.querySelector('input');
    var count = filterRoot.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-text]'));

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-filter', !match);
        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      applyFilter();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
