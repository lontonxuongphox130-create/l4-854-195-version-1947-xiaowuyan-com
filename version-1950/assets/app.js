(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    }

    function startCarousel() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startCarousel();
      });
    });

    showSlide(0);
    startCarousel();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var state = {
    keyword: '',
    genre: '',
    region: ''
  };

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var genre = normalize(card.getAttribute('data-genre'));
      var region = normalize(card.getAttribute('data-region'));
      var matchedKeyword = !state.keyword || haystack.indexOf(state.keyword) !== -1;
      var matchedGenre = !state.genre || genre.indexOf(state.genre) !== -1 || haystack.indexOf(state.genre) !== -1;
      var matchedRegion = !state.region || region.indexOf(state.region) !== -1 || haystack.indexOf(state.region) !== -1;
      card.classList.toggle('hidden', !(matchedKeyword && matchedGenre && matchedRegion));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      state.keyword = normalize(input.value);
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-genre]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('[data-filter-buttons]');
      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('button')).forEach(function (item) {
          item.classList.remove('active');
        });
      }
      button.classList.add('active');
      state.genre = normalize(button.getAttribute('data-filter-genre'));
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-region]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('[data-filter-buttons]');
      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('button')).forEach(function (item) {
          item.classList.remove('active');
        });
      }
      button.classList.add('active');
      state.region = normalize(button.getAttribute('data-filter-region'));
      filterCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('src');
    var prepared = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (prepared || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      prepared = true;
    }

    function startVideo() {
      prepareVideo();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      startVideo();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 320);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
