import { H as Hls } from './hls-dru42stk.js';

function initMobileNav() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let timer = null;

  function show(index) {
    if (slides.length === 0) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initCategoryFilter() {
  const grid = document.querySelector('[data-filter-grid]');

  if (!grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const keywordInput = document.querySelector('[data-filter-keyword]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const regionInput = document.querySelector('[data-filter-region]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const counter = document.querySelector('[data-filter-count]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    const keyword = normalize(keywordInput && keywordInput.value);
    const type = normalize(typeSelect && typeSelect.value);
    const region = normalize(regionInput && regionInput.value);
    const year = normalize(yearSelect && yearSelect.value);
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.tags
      ].join(' '));
      const cardType = normalize(card.dataset.type);
      const cardRegion = normalize(card.dataset.region);
      const cardYear = normalize(card.dataset.year);
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesType = !type || cardType.includes(type);
      const matchesRegion = !region || cardRegion.includes(region);
      const matchesYear = !year || cardYear === year;
      const isVisible = matchesKeyword && matchesType && matchesRegion && matchesYear;

      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = `${visible} 部作品`;
    }
  }

  [keywordInput, typeSelect, regionInput, yearSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  applyFilter();
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll('[data-hls-player]'));

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('[data-play-overlay]');
    const message = shell.querySelector('[data-video-message]');

    if (!video) {
      return;
    }

    const source = video.dataset.src;
    let hasLoaded = false;
    let hls = null;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || '';
      message.classList.toggle('is-visible', Boolean(text));
    }

    function loadSource() {
      if (hasLoaded || !source) {
        return;
      }

      hasLoaded = true;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setMessage(''));
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络错误，播放器正在尝试重新加载。');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体错误，播放器正在尝试恢复。');
            hls.recoverMediaError();
          } else {
            setMessage('视频加载失败，请刷新页面后重试。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
        setMessage('当前浏览器可能不支持 HLS 播放，建议使用 Chrome、Edge 或 Safari 最新版本。');
      }
    }

    async function playVideo() {
      loadSource();
      try {
        await video.play();
      } catch (error) {
        setMessage('点击播放器控制栏可继续尝试播放。');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('loadedmetadata', () => setMessage(''));

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

initMobileNav();
initHero();
initCategoryFilter();
initPlayers();
