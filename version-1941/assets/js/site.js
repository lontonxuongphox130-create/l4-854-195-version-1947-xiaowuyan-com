(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var input = document.querySelector("[data-search-input]");
        var grid = document.querySelector("[data-card-grid]");
        var empty = document.querySelector("[data-empty-state]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var filterValue = "all";

        function applyFilter() {
            if (!grid) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : "";
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var tags = (card.getAttribute("data-tags") || "") + " " + (card.getAttribute("data-kind") || "");
                var queryMatch = !query || text.indexOf(query) !== -1;
                var filterMatch = filterValue === "all" || tags.indexOf(filterValue) !== -1 || text.indexOf(filterValue) !== -1;
                var keep = queryMatch && filterMatch;
                card.style.display = keep ? "" : "none";
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterValue = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilter();
            });
        });
    });
})();
