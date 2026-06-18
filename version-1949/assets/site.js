(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 320) {
          backTop.classList.add('is-visible');
        } else {
          backTop.classList.remove('is-visible');
        }
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      var activeIndex = 0;
      var showSlide = function (index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === activeIndex);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === activeIndex);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
      var searchInput = filterRoot.querySelector('[data-filter-search]');
      var typeSelect = filterRoot.querySelector('[data-filter-type]');
      var regionSelect = filterRoot.querySelector('[data-filter-region]');
      var yearSelect = filterRoot.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
      var empty = filterRoot.querySelector('[data-filter-empty]');
      var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
      };
      var applyFilter = function () {
        var keyword = normalize(searchInput && searchInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.region,
            card.dataset.year,
            card.dataset.tags
          ].join(' '));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) matched = false;
          if (type && normalize(card.dataset.type) !== type) matched = false;
          if (region && normalize(card.dataset.region) !== region) matched = false;
          if (year && normalize(card.dataset.year) !== year) matched = false;
          card.style.display = matched ? '' : 'none';
          if (matched) visible += 1;
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };
      [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
      applyFilter();
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.SEARCH_DATA) {
      var searchForm = searchPage.querySelector('[data-search-form]');
      var searchInputPage = searchPage.querySelector('[data-search-input]');
      var results = searchPage.querySelector('[data-search-results]');
      var emptyState = searchPage.querySelector('[data-search-empty]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInputPage.value = initialQuery;
      var escapeHtml = function (value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
          return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
        });
      };
      var render = function (query) {
        var key = String(query || '').trim().toLowerCase();
        var pool = window.SEARCH_DATA.filter(function (item) {
          if (!key) return true;
          return [item.title, item.region, item.type, item.year, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(key) !== -1;
        }).slice(0, 96);
        results.innerHTML = pool.map(function (item) {
          return '<article class="movie-card">' +
            '<a class="movie-poster" href="' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
              '<img class="poster-img" src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
              '<span class="poster-shade"></span>' +
              '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
              '<span class="poster-play">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
              '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
              '<h3><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
              '<p>' + escapeHtml(item.oneLine) + '</p>' +
              '<div class="tag-row">' + item.tags.split(' ').slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
            '</div>' +
          '</article>';
        }).join('');
        emptyState.classList.toggle('is-visible', pool.length === 0);
      };
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var nextQuery = searchInputPage.value.trim();
        var nextUrl = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
        window.history.replaceState({}, '', nextUrl);
        render(nextQuery);
      });
      searchInputPage.addEventListener('input', function () {
        render(searchInputPage.value);
      });
      render(initialQuery);
    }
  });
})();
