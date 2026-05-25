/**
 * filter-overlay.js — search/filter overlay for moments across all expeditions.
 * Accessible via search icon in expedition view.
 */
import { searchMoments } from '../data/expeditions.js';

export function createFilterOverlay() {
  let root = null;
  let inputEl = null;
  let resultsEl = null;
  let onSelect = null;
  let debounce = 0;

  function renderResults(results) {
    if (!resultsEl) return;
    if (results.length === 0) {
      resultsEl.innerHTML = '<p class="filter__empty">Geen resultaten gevonden.</p>';
      return;
    }
    resultsEl.innerHTML = results.map(({ expedition, moment }) => `
      <button
        type="button"
        class="filter__result"
        data-expedition="${expedition.id}"
        data-moment="${moment.id}"
      >
        <span class="filter__result-date">${moment.date}</span>
        <span class="filter__result-title">${moment.title}</span>
        <span class="filter__result-expedition">${expedition.captain} · ${expedition.yearShort}</span>
      </button>
    `).join('');

    resultsEl.querySelectorAll('.filter__result').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        onSelect?.({
          expeditionId: btn.dataset.expedition,
          momentId: btn.dataset.moment,
        });
      });
    });
  }

  function onInput() {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = inputEl?.value ?? '';
      if (q.length < 2) {
        if (resultsEl) resultsEl.innerHTML = '';
        return;
      }
      const results = searchMoments(q);
      renderResults(results);
    }, 200);
  }

  return {
    mount(container, { onSelectResult }) {
      if (root) return;
      onSelect = onSelectResult;

      root = document.createElement('div');
      root.className = 'filter-overlay';
      root.innerHTML = `
        <div class="filter__backdrop"></div>
        <div class="filter__panel">
          <div class="filter__header">
            <input
              type="text"
              class="filter__input"
              placeholder="Zoek in alle expedities…"
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" class="filter__close" aria-label="Sluiten">✕</button>
          </div>
          <div class="filter__results" role="list"></div>
        </div>
      `;

      inputEl = root.querySelector('.filter__input');
      resultsEl = root.querySelector('.filter__results');

      inputEl.addEventListener('input', onInput);

      root.querySelector('.filter__close').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.hide();
      });

      root.querySelector('.filter__backdrop').addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.hide();
      });

      container.appendChild(root);
    },

    show() {
      if (!root) return;
      root.classList.add('filter-overlay--visible');
      setTimeout(() => inputEl?.focus(), 300);
    },

    hide() {
      if (!root) return;
      root.classList.remove('filter-overlay--visible');
      if (inputEl) inputEl.value = '';
      if (resultsEl) resultsEl.innerHTML = '';
    },

    isVisible() {
      return !!root?.classList.contains('filter-overlay--visible');
    },

    destroy() {
      clearTimeout(debounce);
      if (root?.parentNode) root.parentNode.removeChild(root);
      root = null;
      inputEl = null;
      resultsEl = null;
      onSelect = null;
    },
  };
}
