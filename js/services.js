/* Accessible local-only service category filter. All cards remain visible without JS. */
(() => {
  'use strict';
  const start = () => {
    document.querySelectorAll('[data-rse-services]').forEach(group => {
      const controls = [...group.querySelectorAll('[data-rse-filter]')];
      const cells = [...group.querySelectorAll('[data-rse-category]')];
      const status = group.querySelector('[data-rse-visible-count]');
      if (!controls.length || !cells.length) return;
      const show = category => {
        let count = 0;
        for (const cell of cells) {
          cell.hidden = category !== 'all' && cell.dataset.rseCategory !== category;
          if (!cell.hidden) count++;
        }
        controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rseFilter === category)));
        if (status) status.textContent = count + ' ' + (count === 1 ? status.dataset.singular : status.dataset.plural);
      };
      controls.forEach(button => button.addEventListener('click', () => show(button.dataset.rseFilter)));
      show('all');
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();