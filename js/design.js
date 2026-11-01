/* Industrial Dark — entirely local progressive enhancement (no network access). */
(() => {
  'use strict';
  const init = () => {
    // The theme's generated header has no Bootstrap toggle target. Make it usable
    // with mouse, touch and keyboard without a third-party UI library.
    document.querySelectorAll('.navigation .navbar-toggler').forEach((toggle, i) => {
      const nav = toggle.closest('nav');
      const panel = nav && nav.querySelector('.navbar-collapse');
      if (!panel) return;
      panel.id ||= 'rse-mobile-navigation-' + i;
      toggle.setAttribute('aria-controls', panel.id);
      toggle.setAttribute('aria-expanded', 'false');
      const close = () => {
        panel.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
      };
      toggle.addEventListener('click', () => {
        const open = panel.classList.toggle('show');
        toggle.setAttribute('aria-expanded', String(open));
      });
      panel.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && panel.classList.contains('show')) {
          close();
          toggle.focus();
        }
      });
      const mq = window.matchMedia('(min-width: 992px)');
      mq.addEventListener?.('change', event => { if (event.matches) close(); });
    });

    // A functional engineering-stage explainer. Descriptions are contained in
    // HTML data attributes, with separate German and English content.
    document.querySelectorAll('[data-rse-stages]').forEach(group => {
      const buttons = [...group.querySelectorAll('[data-rse-stage]')];
      const title = group.querySelector('[data-rse-stage-title]');
      const copy = group.querySelector('[data-rse-stage-copy]');
      if (!title || !copy) return;
      buttons.forEach(button => button.addEventListener('click', () => {
        for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
        title.textContent = button.dataset.title || '';
        copy.textContent = button.dataset.description || '';
      }));
    });

    // A self-contained demonstration with deterministic simulated values.
    // It never connects to hardware or sends data to a server.
    document.querySelectorAll('[data-rse-hmi]').forEach(panel => {
      const slider = panel.querySelector('[data-rse-load]');
      const powerButton = panel.querySelector('[data-rse-power]');
      const status = panel.querySelector('[data-rse-status]');
      const loadValue = panel.querySelector('[data-rse-load-value]');
      const outputValue = panel.querySelector('[data-rse-output-value]');
      const loadBar = panel.querySelector('[data-rse-load-bar]');
      const outputBar = panel.querySelector('[data-rse-output-bar]');
      if (![slider,powerButton,status,loadValue,outputValue,loadBar,outputBar].every(Boolean)) return;
      let powered = true;
      const render = () => {
        const load = Number(slider.value);
        const output = powered ? Math.round(load * 0.82) : 0;
        loadValue.textContent = load + '%';
        outputValue.textContent = output + '%';
        loadBar.style.width = load + '%';
        outputBar.style.width = output + '%';
        status.textContent = powered ? status.dataset.online : status.dataset.offline;
        panel.dataset.rseOffline = String(!powered);
        powerButton.textContent = powered ? powerButton.dataset.stop : powerButton.dataset.start;
        powerButton.setAttribute('aria-pressed', String(powered));
      };
      slider.addEventListener('input', render);
      powerButton.addEventListener('click', () => { powered = !powered; render(); });
      render();
    });

    // Reveal only when the browser supports it and the visitor permits motion.
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const reveal = document.querySelectorAll('.rse-reveal');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rse-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {threshold:0.08, rootMargin:'0px 0px -16px 0px'});
      reveal.forEach(el => observer.observe(el));
      document.documentElement.classList.add('rse-motion-ready');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
