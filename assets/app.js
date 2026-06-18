(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('.menu-toggle');
    var panel = one('.mobile-panel');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
      } else {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    var thumbs = all('.hero-thumb', hero);
    var prev = one('.hero-prev', hero);
    var next = one('.hero-next', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.concat(thumbs).forEach(function (control) {
      control.addEventListener('click', function () {
        show(Number(control.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(input, cards, empty) {
    var query = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var matched = !query || text.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  function setupLocalSearch() {
    all('[data-card-search]').forEach(function (form) {
      var input = one('input', form);
      var target = document.getElementById(form.getAttribute('data-card-search'));
      var empty = one('[data-empty-for="' + form.getAttribute('data-card-search') + '"]');
      if (!input || !target) {
        return;
      }

      var cards = all('.movie-card', target);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(input, cards, empty);
      });
      input.addEventListener('input', function () {
        filterCards(input, cards, empty);
      });
    });
  }

  function setupSearchPage() {
    var page = one('[data-search-page]');
    if (!page) {
      return;
    }

    var input = one('#search-query');
    var grid = one('#search-grid');
    var empty = one('[data-empty-for="search-grid"]');
    if (!input || !grid) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');
    if (keyword) {
      input.value = keyword;
    }

    var cards = all('.movie-card', grid);
    var run = function () {
      filterCards(input, cards, empty);
    };

    input.addEventListener('input', run);
    page.addEventListener('submit', function (event) {
      event.preventDefault();
      run();
    });
    run();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalSearch();
    setupSearchPage();
  });
})();
