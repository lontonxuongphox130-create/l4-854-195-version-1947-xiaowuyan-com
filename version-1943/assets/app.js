(function () {
  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char];
    });
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function fillOptions(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var genreSelect = scope.querySelector(".genre-filter");
    var yearSelect = scope.querySelector(".year-filter");
    var genres = new Set();
    var years = new Set();

    cards.forEach(function (card) {
      String(card.dataset.genre || "").split(/[,，、/|\s]+/).forEach(function (item) {
        if (item) {
          genres.add(item);
        }
      });
      if (card.dataset.year) {
        years.add(card.dataset.year);
      }
    });

    if (genreSelect && genreSelect.options.length <= 1) {
      Array.from(genres).sort().forEach(function (genre) {
        var option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
      });
    }

    if (yearSelect && yearSelect.options.length <= 1) {
      Array.from(years).sort().reverse().forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }
  }

  function setupLocalFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      fillOptions(scope);
      var input = scope.querySelector(".filter-search");
      var genreSelect = scope.querySelector(".genre-filter");
      var yearSelect = scope.querySelector(".year-filter");
      var empty = scope.querySelector(".empty-state");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function update() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var genre = genreSelect ? genreSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = String(card.dataset.search || "").toLowerCase();
          var genres = String(card.dataset.genre || "");
          var matched = true;
          if (text && search.indexOf(text) === -1) {
            matched = false;
          }
          if (genre && genres.indexOf(genre) === -1) {
            matched = false;
          }
          if (year && card.dataset.year !== year) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, genreSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-frame\" href=\"" + escapeHTML(movie.href) + "\">" +
      "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-chip\">播放</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\">" + escapeHTML(movie.year) + " · " + escapeHTML(movie.region) + " · " + escapeHTML(movie.type) + "</div>" +
      "<h3><a href=\"" + escapeHTML(movie.href) + "\">" + escapeHTML(movie.title) + "</a></h3>" +
      "<p>" + escapeHTML(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    function render(query) {
      var text = String(query || "").trim().toLowerCase();
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        if (!text) {
          return true;
        }
        return String(movie.search || "").toLowerCase().indexOf(text) !== -1;
      });
      results.innerHTML = matched.map(buildSearchCard).join("");
      empty.hidden = matched.length !== 0;
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value : "";
        var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        render(query);
      });
    }

    render(initial);
  }

  function setupPlayer() {
    var shells = document.querySelectorAll("[data-player]");
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var stream = shell.getAttribute("data-stream");
      var hls = null;

      function start() {
        if (!video || !stream) {
          return;
        }
        if (!video.dataset.ready) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.controls = true;
          video.dataset.ready = "1";
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
