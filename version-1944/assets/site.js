(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var menuPanel = document.querySelector('[data-menu-panel]');

        if (menuButton && menuPanel) {
            menuButton.addEventListener('click', function () {
                var open = menuPanel.classList.toggle('open');
                menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, pos) {
                    slide.classList.toggle('active', pos === current);
                });
                dots.forEach(function (dot, pos) {
                    dot.classList.toggle('active', pos === current);
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

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
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

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var listSearch = document.querySelector('[data-list-search]');
        var cardList = document.querySelector('[data-card-list]');
        if (listSearch && cardList) {
            var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));
            listSearch.addEventListener('input', function () {
                var keyword = listSearch.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                    card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
                });
            });
        }

        var searchResults = document.querySelector('[data-search-results]');
        if (searchResults && window.SEARCH_INDEX) {
            var input = document.querySelector('[data-search-input]');
            var summary = document.querySelector('[data-search-summary]');
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';

            if (input) {
                input.value = initial;
            }

            function createResult(item) {
                var card = document.createElement('a');
                card.className = 'search-card';
                card.href = item.url;

                var image = document.createElement('img');
                image.src = item.cover;
                image.alt = item.title;
                image.loading = 'lazy';

                var box = document.createElement('div');
                var title = document.createElement('h3');
                title.textContent = item.title;
                var desc = document.createElement('p');
                desc.textContent = item.oneLine || item.summary || '';
                var meta = document.createElement('span');
                meta.textContent = [item.year, item.region, item.genre].filter(Boolean).join(' · ');

                box.appendChild(title);
                box.appendChild(desc);
                box.appendChild(meta);
                card.appendChild(image);
                card.appendChild(box);
                return card;
            }

            function render(keyword) {
                var query = String(keyword || '').trim().toLowerCase();
                searchResults.innerHTML = '';

                if (!query) {
                    if (summary) {
                        summary.textContent = '请输入关键词开始搜索。';
                    }
                    return;
                }

                var results = window.SEARCH_INDEX.filter(function (item) {
                    return item.text.indexOf(query) !== -1;
                }).slice(0, 120);

                if (summary) {
                    summary.textContent = results.length ? '共找到 ' + results.length + ' 个相关结果。' : '没有找到匹配影片。';
                }

                results.forEach(function (item) {
                    searchResults.appendChild(createResult(item));
                });
            }

            if (input) {
                input.addEventListener('input', function () {
                    render(input.value);
                });
            }
            render(initial);
        }
    });
})();
