import { MOVIES } from './movies.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const category = document.querySelector('[data-search-category]');
const type = document.querySelector('[data-search-type]');
const region = document.querySelector('[data-search-region]');
const results = document.querySelector('[data-search-results]');
const count = document.querySelector('[data-search-count]');

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function getInitialQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

function cardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).join(' ');
  return `
        <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-year="${escapeHtml(movie.yearInt)}" data-category="${escapeHtml(movie.categorySlug)}" data-tags="${escapeHtml(tags)}">
          <a href="videos/${escapeHtml(movie.id)}.html" class="poster-wrap" aria-label="观看 ${escapeHtml(movie.title)}">
            <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="poster-gradient"></span>
            <span class="poster-play">▶</span>
            <span class="poster-badge">${escapeHtml(movie.category)}</span>
            <span class="poster-year">${escapeHtml(movie.year)}</span>
          </a>
          <div class="card-body">
            <a href="videos/${escapeHtml(movie.id)}.html" class="card-title">${escapeHtml(movie.title)}</a>
            <p class="card-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.type)} · ${escapeHtml(movie.genre)}</p>
            <p class="card-desc">${escapeHtml(movie.oneLine)}</p>
          </div>
        </article>`;
}

function runSearch() {
  const query = normalize(input && input.value);
  const selectedCategory = normalize(category && category.value);
  const selectedType = normalize(type && type.value);
  const selectedRegion = normalize(region && region.value);

  const matched = MOVIES.filter((movie) => {
    const haystack = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.genre,
      movie.oneLine,
      movie.summary,
      (movie.tags || []).join(' ')
    ].join(' '));

    const matchesQuery = !query || haystack.includes(query);
    const matchesCategory = !selectedCategory || normalize(movie.categorySlug) === selectedCategory;
    const matchesType = !selectedType || normalize(movie.type).includes(selectedType);
    const matchesRegion = !selectedRegion || normalize(movie.region).includes(selectedRegion);

    return matchesQuery && matchesCategory && matchesType && matchesRegion;
  }).slice(0, 120);

  if (count) {
    count.textContent = `${matched.length} 个结果`;
  }

  if (!results) {
    return;
  }

  if (matched.length === 0) {
    results.innerHTML = '<div class="no-results">未找到相关结果，可以尝试更换关键词或筛选条件。</div>';
    return;
  }

  results.innerHTML = matched.map(cardTemplate).join('\n');
}

if (input) {
  input.value = getInitialQuery();
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set('q', input.value || '');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    runSearch();
  });
}

[input, category, type, region].forEach((control) => {
  if (control) {
    control.addEventListener('input', runSearch);
    control.addEventListener('change', runSearch);
  }
});

runSearch();
